const template: HTMLTemplateElement = document.createElement("template");

template.innerHTML = /*html*/`

<style>

.main {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    color: lightgrey;
    margin: 10px;
    min-width: 350px;
}

.form-element {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: ;
    margin: 5px;
}


.line {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    max-width: 100%;
}

.confirm-load-div {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
    margin: 5px;
    gap: 10px;
}

 #results-container {
    display: flex;
    width: 100%;
    background-color: rgb(23, 23, 26);
    flex-direction: column;
    flex-wrap: nowrap;
    max-height: 400px;
    min-height: 200px;
    overflow-y: scroll;
}

.result {
    text-align: left;
    margin: 1px;
    padding: 3px 3px 3px 15px;
    text-overflow: ellipsis;
    background-color: #212529;
    border: solid 1px gray;
    border-radius: 3px;
    gap: 10px;
}

.result:hover {
    background-color: #343a40;
    cursor: pointer;
}

.result.selected {
    background-color: #495057;
}

input {
    width: 200px;
}

button {
    margin: 5px;
    border-radius: 4px;
    width: max-content;
}

#log {
    color: white;
    margin: 5px;
    padding: 5px;
    border-radius: 4px;
}

.search-icon {
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-search' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E");
    width: 16px;
}

</style>

<div class="main">
    <div class="form-element">
        <div class="line">
            <label for="user">User Name</label>
            <input id="user-input" type="text" placeholder="Username ... ">
        </div>
        <div class="line">
            <label for="project">Project Name</label>
            <input id="project-input" type="text" placeholder="Project name ...">
        </div>
        <button id="search-button" type="button">
            <i class="search-icon"></i>
            Search
        </button>
    </div>
    
    <div id="results-container">

    </div>
    
    <div class="confirm-load-div" id="confirm" style="display: none" >
        <div id="project-name" style="font-weight: bold"></div>
        <div id="date"></div>
        <button id="load-button" type="button">Load</button>
    </div>
    
</div>    
`

export default class LoadProjectElement extends HTMLElement {
    initialized: Boolean;
    selectedProject: string;
    selectedResult: HTMLDivElement;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }

    connectedCallback() {
        if (!this.initialized) {
            this.shadowRoot?.appendChild(template.content.cloneNode(true));
        }
    }

    get userInput(): HTMLInputElement {
        return this.shadowRoot?.getElementById("user-input") as HTMLInputElement;
    }

    get projectInput(): HTMLInputElement {
        return this.shadowRoot?.getElementById("project-input") as HTMLInputElement;
    }

    get searchButton(): HTMLButtonElement {
        return this.shadowRoot?.getElementById("search-button") as HTMLButtonElement;
    }

    get resultsContainer(): HTMLDivElement {
        return this.shadowRoot?.getElementById("results-container") as HTMLDivElement;
    }

    get loadButton(): HTMLButtonElement {
        return this.shadowRoot?.getElementById("load-button") as HTMLButtonElement;
    }

    get projectName(): HTMLDivElement {
        return this.shadowRoot?.getElementById("project-name") as HTMLDivElement;
    }

    get date(): HTMLDivElement {
        return this.shadowRoot?.getElementById("date") as HTMLDivElement;
    }

    get confirmLoadDiv(): HTMLDivElement {
        return this.shadowRoot?.getElementById("confirm") as HTMLDivElement;
    }

    parseDate(dateString: string) {
        const date = new Date(dateString);

        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear().toString().slice(-2); // slice(-2) gets the last 2 digits of the year
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const amOrPm = hours < 12 ? 'AM' : 'PM';
        return `${month}/${day}/${year} ${hours % 12}:${minutes} ${amOrPm}`;
    }

    addResults(results: any) {
        this.resultsContainer.innerHTML = "";
        this.selectedProject = "";
        results.forEach((result: any) => {
            const resultElement = document.createElement("div");
            resultElement.classList.add("result");
            resultElement.innerText = `${result.username} - ${result.name} - ${this.parseDate(result.date)}`;
            resultElement.addEventListener("click", () => {
                this.selectedResult?.classList.remove("selected");
                this.selectedProject = result.id;
                this.selectedResult = resultElement;
                resultElement.classList.add("selected");
                this.projectName!.innerText = result.name;
                this.date!.innerText = this.parseDate(result.date);
                this.confirmLoadDiv!.style.display = "flex";
            });
            this.resultsContainer.appendChild(resultElement);
        });
    }
}

