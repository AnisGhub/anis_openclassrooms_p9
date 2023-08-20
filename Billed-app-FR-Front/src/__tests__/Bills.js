/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // add expect
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // adding new tests
    test("Then should navigate to NewBill page when new bill button is clicked", async () => {
      const onNavigate = jest.fn();
      const document = { querySelector: jest.fn(), querySelectorAll: jest.fn() };
      const store = null;
      const localStorage = {};

      const billsInstance = new Bills({ document, onNavigate, store, localStorage });

      // Simulate click on the "Nouvelle note de frais" button
      billsInstance.handleClickNewBill();

      // Wait for the navigation to complete
      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      });
    });

    test("Then modal should open with bill image when icon eye is clicked", async () => {
      const onNavigate = jest.fn();
      document.body.innerHTML = BillsUI({ data: bills });
      const store = null;
      const localStorage = {};

      const mockIcon = {
        getAttribute: jest.fn().mockReturnValue("mockBillUrl"),
      };
      // Mock jQuery modal function
      $.fn.modal = jest.fn();

      const billsInstance = new Bills({
        document,
        onNavigate,
        store: store,
        localStorage: localStorage,
      });

      // Simulate clicking on the icon eye
      billsInstance.handleClickIconEye(mockIcon);

      // Wait for the modal to be shown
      await waitFor(() => {
        const modalElement = document.getElementById("modaleFile");
        return modalElement.classList.contains("show");
      });

      // Check if the necessary functions were called
      expect(mockIcon.getAttribute).toHaveBeenCalledWith("data-bill-url");
      expect(document.getElementById("modaleFile")).toContainHTML("mockBillUrl");
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });
  });
});

// integration test
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(async () => {
      // Simulate user being logged in
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Setting up the HTML structure
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Navigate to the Bills page
      router();
      window.onNavigate(ROUTES_PATH.Bills);
    });

    test("Then bills should be fetched and displayed successfully", async () => {
      // Create an instance of the Bills component
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Call the getBills method and fetch displayed bill elements
      const fetchedBills = await billsInstance.getBills();

      // Render the BillsUI with the fetched data
      document.body.innerHTML = BillsUI({ data: fetchedBills });

      await waitFor(() => {
        const tbody = screen.getByTestId("tbody");
        const displayedBillElements = tbody.querySelectorAll("tr");

        // assertions
        expect(displayedBillElements.length).toBe(fetchedBills.length);
      });
    });

    test("Then bills should be fetched and fails", async () => {
      // Create an instance of the Bills component
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Mock the getBills method to return a rejected promise
      billsInstance.getBills = jest.fn(() => {
        return Promise.reject(new Error("Request failed with status 404"));
      });

      // simulate Call getBills to trigger the error
      try {
        await billsInstance.getBills();
      } catch (error) {
        // Render the BillsUI with the mocked error
        document.body.innerHTML = BillsUI({ error: error.message });
      }

      await waitFor(() => {
        const errorMessage = screen.getByText("Request failed with status 404");
        // Perform assertions
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
