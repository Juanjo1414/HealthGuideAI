import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { renderAt, triageResponse } from "../test/utils";
import { requestTriage, TriageApiError } from "../api/triageApi";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../api/triageApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/triageApi")>()),
  requestTriage: vi.fn(),
}));

const mockedRequest = vi.mocked(requestTriage);

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, user: null } as unknown as ReturnType<typeof useAuth>);
});

describe("HomePage — triaje sin cuenta", () => {
  it("se puede evaluar sin iniciar sesión y el botón exige texto", async () => {
    renderAt(<HomePage />);
    const submit = screen.getByRole("button", { name: /iniciar evaluación de síntomas/i });

    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Tengo tos seca");
    expect(submit).toBeEnabled();
    expect(screen.getByText(/sin cuenta, no guardamos tu texto/i)).toBeInTheDocument();
  });

  it("el autocompletado llena el campo y la duración se agrega al texto enviado", async () => {
    mockedRequest.mockResolvedValue(triageResponse());
    renderAt(<HomePage />);

    await userEvent.click(screen.getByRole("button", { name: /fiebre y dolor de garganta/i }));
    await userEvent.click(screen.getByRole("radio", { name: "1 a 3 días" }));
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/resultado"));
    expect(mockedRequest).toHaveBeenCalledWith("Tengo fiebre y dolor de garganta. Duración: 1 a 3 días.");
  });

  it("sin conexión muestra el panel offline con los teléfonos, no un error genérico", async () => {
    mockedRequest.mockRejectedValue(new TriageApiError("sin red", 0));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    expect(await screen.findByText(/servidor inaccesible o sin conexión/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /llamar 123/i })[0]).toHaveAttribute("href", "tel:123");
  });

  it("un error 5xx del servidor lleva a la pantalla de contingencia", async () => {
    mockedRequest.mockRejectedValue(new TriageApiError("El modelo no pudo procesar la solicitud.", 502));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/500"));
  });

  it("un 429 se muestra como alerta con el mensaje del backend", async () => {
    mockedRequest.mockRejectedValue(new TriageApiError("Demasiadas solicitudes, espera un momento.", 429));
    renderAt(<HomePage />);

    await userEvent.type(screen.getByLabelText(/describe tus síntomas/i), "Me duele la cabeza");
    await userEvent.click(screen.getByRole("button", { name: /iniciar evaluación/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Demasiadas solicitudes");
  });

  it("llega con texto precargado desde 'Reevaluar'", () => {
    renderAt(<HomePage />, { state: { prefill: "Dolor lumbar desde hace una semana" } });

    expect(screen.getByLabelText(/describe tus síntomas/i)).toHaveValue("Dolor lumbar desde hace una semana");
  });
});
