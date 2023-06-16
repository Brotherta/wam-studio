const placeholderTemplate = document.createElement("template");
placeholderTemplate.innerHTML = /*html*/`
  <style>
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .loading-wheel {
      border: 4px solid #f3f3f3; /* Light gray */
      border-top: 4px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>

  <div class="placeholder">
    <div class="loading-wheel"></div>
  </div>
`;

export default class PlaceholderElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        if (this.shadowRoot !== null) {
            this.shadowRoot.innerHTML = placeholderTemplate.innerHTML;
        }
    }
}