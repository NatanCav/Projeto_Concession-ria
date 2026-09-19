import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/tests/test-utils";
import { FilterSidebar } from "./FilterSidebar";

describe("FilterSidebar", () => {
  it("calls onChange with the selected vehicle type", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();

    renderWithProviders(<FilterSidebar filters={{}} onChange={onChange} onClear={onClear} />);

    const typeSelect = screen.getByLabelText("Tipo de veículo");
    await user.selectOptions(typeSelect, "MOTO");

    expect(onChange).toHaveBeenCalledWith({ vehicleType: "MOTO" });
  });

  it("lists brands and categories fetched from the API", async () => {
    renderWithProviders(<FilterSidebar filters={{}} onChange={vi.fn()} onClear={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Toyota" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Sedan" })).toBeInTheDocument();
    });
  });

  it("calls onClear when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    renderWithProviders(<FilterSidebar filters={{}} onChange={vi.fn()} onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onClear).toHaveBeenCalled();
  });
});
