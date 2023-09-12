/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";

/**
 * Describes the behavior when the user is connected as an employee.
 */
describe("Given I am connected as an employee", () => {
  /**
   * Describes the behavior when the user is on the NewBill Page.
   */
  describe("When I am on NewBill Page", () => {
    /**
     * Test to verify that the mail icon in vertical layout is highlighted.
     * @async
     * @test
     */
    test("Then mail icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
    });
  });

  /**
   * Describes the behavior when a user uploads an accepted format file.
   */
  describe("When I am on NewBill page, and a user upload an accepted format file", () => {
    /**
     * Test to verify that the file name is correctly displayed into the input.
     * @test
     */
    test("Then, the file name should be correctly displayed into the input", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = mockStore;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.png"], "file.png", { type: "image/png" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("file.png");
      expect(newBill.fileName).toBe("file.png");
    });
  });

  /**
   * Describes the behavior when a user uploads an unaccepted format file.
   */
  describe("When I am on NewBill page, and a user upload a unaccepted format file", () => {
    /**
     * Test to verify that the bill file name is null,
     * and an alert should be displayed.
     * @test
     */
    test("Then, the bill name should not be null, and a alert should be displayed", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = mockStore;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      window.alert = jest.fn();

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });

      jest.spyOn(window, "alert");

      expect(alert).toHaveBeenCalled();
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("file.pdf");
      expect(newBill.fileName).toBe(null);
    });
  });

  /**
   * Describes the behavior when a user submits a new bill.
   */
  describe("When I am on NewBill page, and a user submit a new bill", () => {
    /**
     * Test to verify that a bill is created.
     * @test
     */
    test("then a bill is created", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = mockStore;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const submit = screen.getByTestId("form-new-bill");
      submit.addEventListener("submit", handleSubmit);
      fireEvent.submit(submit);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

/**
 * integration test
 * Describes the behavior when the user is connected as an employee and submits a new bill.
 */
describe("Given I am connected as an employee", () => {
  /**
   * Describes the behavior when the user submits a new bill and it is added using a mock API POST.
   */
  describe("When I submit a new bill", () => {
    /**
     * Test to add a bill from mock API POST.
     * @async
     * @test
     */
    test("add a bill from mock API POST", async () => {
      const postSpy = jest.spyOn(mockStore, "bills");
      //call POST function
      const billIsCreated = await postSpy().update();

      //tests
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(billIsCreated.id).toBe("47qAXb6fIm2zOKkLzMro");
    });
  });
  /**
   * Describes the behavior when an error occurs on the API during bill creation.
   */
  describe("When an error occurs on API", () => {
    /**
     * Test to add a bill from mock API and it fails with a 404 message error.
     * @async
     * @test
     */
    test("Add a bill from mock API and fails with 404 message error", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      //error simulation
      const mockedError = jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      // tests
      await expect(mockedError().update).rejects.toThrow("Erreur 404");
      expect(newBill.billId).toBeNull();
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    });

    /**
     * Test to add a bill from mock API and it fails with a 500 message error.
     * @async
     * @test
     */
    test("Add a bill from mock API and fails with 500 message error", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      //error simulation
      const mockedError = jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      // tests
      await expect(mockedError().update).rejects.toThrow("Erreur 500");
      expect(newBill.billId).toBeNull();
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    });
  });
});
