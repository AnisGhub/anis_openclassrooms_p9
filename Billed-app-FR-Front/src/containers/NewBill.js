import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    // Find the submit button element
    this.submitButton = this.document.getElementById("btn-send-bill");
    new Logout({ document, localStorage, onNavigate });
  }
  // Fix bug file extension
  handleChangeFile = (e) => {
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    let file = fileInput.files[0];
    let fileName = file.name || null;
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert("Invalid file extension. Please choose a jpg, jpeg, or png file.");
      fileInput.value = ""; // Clear the file input
      this.submitButton.disabled = true; // Disable submit button
      return;
    }

    this.submitButton.disabled = false; // Enable submit button

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    this.formData = formData; // so it can be used in other methods
    this.fileName = fileName;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    // if image format is valid
    // add this part in handleSubmit to upload image and create new bill only when image format is valid and form is complete
    this.store
      .bills()
      .create({
        data: this.formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
      })
      .then(() => {
        this.updateBill(bill);
      })
      .catch((error) => console.error(error));
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
