import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditEntryModal } from "./EditEntryModal";

describe("EditEntryModal", () => {
  const mockEntry = {
    id: "entry-123",
    description: "Test description",
    startTime: "2024-01-15T09:00:00Z",
    endTime: "2024-01-15T10:30:00Z",
    duration: 90,
    invoiced: false,
    createdAt: "2024-01-15T09:00:00Z",
    projectId: null,
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for projects
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: "project-1",
            name: "Website",
            client: { id: "client-1", name: "Acme Corp" },
          },
        ]),
    });
  });

  it("renders with entry data", () => {
    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText("Edit Time Entry")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
  });

  it("shows duration in hours and minutes", () => {
    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // 90 minutes = 1 hour, 30 minutes
    const hoursInput = screen.getByDisplayValue("1");
    const minutesInput = screen.getByDisplayValue("30");

    expect(hoursInput).toBeInTheDocument();
    expect(minutesInput).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows invoiced checkbox state correctly", () => {
    const invoicedEntry = { ...mockEntry, invoiced: true };

    render(
      <EditEntryModal
        entry={invoicedEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const checkbox = screen.getByLabelText("Mark as invoiced");
    expect(checkbox).toBeChecked();
  });

  it("allows toggling invoiced state", () => {
    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const checkbox = screen.getByLabelText("Mark as invoiced");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("allows editing description", () => {
    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const input = screen.getByDisplayValue("Test description");
    fireEvent.change(input, { target: { value: "New description" } });

    expect(screen.getByDisplayValue("New description")).toBeInTheDocument();
  });

  it("disables submit button when duration is zero", () => {
    const zeroDurationEntry = { ...mockEntry, duration: 0 };

    render(
      <EditEntryModal
        entry={zeroDurationEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByText("Save Changes");
    expect(submitButton).toBeDisabled();
  });

  it("submits updated data on form submit", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "project-1",
              name: "Website",
              client: { id: "client-1", name: "Acme Corp" },
            },
          ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockEntry, description: "Updated" }),
      });

    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Change description
    const input = screen.getByDisplayValue("Test description");
    fireEvent.change(input, { target: { value: "Updated description" } });

    // Submit form
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shows date as disabled", () => {
    render(
      <EditEntryModal
        entry={mockEntry}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Find the date input by its type since label isn't properly associated
    const dateInput = screen.getByDisplayValue("2024-01-15");
    expect(dateInput).toBeDisabled();
    expect(screen.getByText("Date cannot be changed")).toBeInTheDocument();
  });
});
