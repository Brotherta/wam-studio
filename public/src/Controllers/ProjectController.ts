import App from "../App";
import {BACKEND_URL} from "../Env";


export default class ProjectController {

    app: App;
    saved: boolean = true;
    inProject: boolean = false;
    projectId: string = "";
    projectName: string = "";
    projectUser: string = "";
    isLogged: boolean = false;

    predefinedUser: string = "";

    constructor(app: App) {
        this.app = app;
        this.isLoggedIn();
        // @ts-ignore
        if (window.myId) {
            // @ts-ignore
            this.predefinedUser = window.myId;
        }
    }

    async openSaveProject() {
        this.app.projectView.mountSave();
        await this.initSaveProject();
        this.app.projectView.show();
    }

    openLoadProject() {
        this.app.projectView.mountLoad();
        this.initLoadProject();
        this.app.projectView.show();
    }

    async openLogin() {
        this.app.projectView.mountLogin();
        await this.initLogin();
        this.app.projectView.show();
    }

    openConfirm(message: string, confirm: () => void, cancel: () => void) {
        this.app.projectView.mountConfirm();
        this.initConfirm(message, confirm, cancel);
        this.app.projectView.show();
    }

    async initSaveProject() {
        if (this.inProject) {
            this.app.projectView.saveElement.user.value = this.projectUser;
            this.app.projectView.saveElement.project.value = this.projectName;
        }

        if (!this.app.projectView.saveElement.initialized) {
            if (this.predefinedUser !== "") {
                this.projectUser = this.predefinedUser;
                this.app.projectView.saveElement.user.value = this.projectUser;
                this.app.projectView.saveElement.disableUserInput();
            }
            this.app.projectView.saveElement.initialized = true;
            this.app.projectView.saveElement.saveProjectButton.addEventListener("click", async () => {
                await this.saveProject();
            });
        }
    }

    initLoadProject() {
        if (!this.app.projectView.loadElement.initialized) {
            this.app.projectView.loadElement.initialized = true;

            this.app.projectView.loadElement.searchButton.addEventListener("click", async () => {
                let url = BACKEND_URL + "/projects";
                let user = this.app.projectView.loadElement.userInput.value;
                let project = this.app.projectView.loadElement.projectInput.value;
                let query = "";
                if (user !== "" || project !== "") {
                    query = `/search?user=${user}&project=${project}`;
                }
                let response = await fetch(url + query, {
                    credentials: "include"
                });
                if (response.status === 200) {
                    let responseData = await response.json();
                    this.app.projectView.loadElement.addResults(responseData);
                }
                else if (response.status === 401) {
                    console.log("Not logged in");
                }
            });

            this.app.projectView.loadElement.loadButton.addEventListener("click", async () => {
                if (this.app.projectView.loadElement.selectedProject !== "") {
                    let url = BACKEND_URL + "/projects/" + this.app.projectView.loadElement.selectedProject;
                    let response = await fetch(url);
                    if (response.status === 200) {
                        let responseData = await response.json();

                        this.projectId = responseData.id;
                        this.projectName = responseData.project;
                        this.projectUser = responseData.user;
                        this.inProject = true;
                        this.saved = true;
                        await this.app.loader.loadProject(responseData.data);
                        this.app.projectView.close();
                    }
                }
            });

            this.app.projectView.loadElement.deleteButton.addEventListener("click", async () => {
                if (this.app.projectView.loadElement.selectedProject !== "") {
                    let url = BACKEND_URL + "/projects/" + this.app.projectView.loadElement.selectedProject;
                    let response = await fetch(url, {
                        method: "DELETE",
                        credentials: "include"
                    });
                    if (response.status === 200) {
                        this.app.projectView.loadElement.selectedProject = "";
                        this.app.projectView.loadElement.userInput.value = "";
                        this.app.projectView.loadElement.projectInput.value = "";
                        this.app.projectView.loadElement.searchButton.click();
                    }
                }
            });
        }
    }

    async initLogin() {
        if (!this.app.projectView.loginElement.initialized) {
            this.app.projectView.loginElement.initialized = true;
            this.app.projectView.loginElement.logInButton.addEventListener("click", async () => {
                await this.login();
            });
            this.app.projectView.loginElement.logOutButton.addEventListener("click", async () => {
                await this.logout();
            });
        }

        this.app.projectView.updateLogin(this.isLogged);
    }

    initConfirm(message: string, confirm: () => void, cancel: () => void) {
        this.app.projectView.confirmElement.setMessage(message);
        this.app.projectView.confirmElement.confirmButton.onclick = () => {
            confirm();
            this.app.projectView.close();
        }
        this.app.projectView.confirmElement.cancelButton.onclick = () => {
            cancel();
            this.app.projectView.close();
        }
    }

    async saveProject(override: boolean = false) {
        let url = BACKEND_URL + "/projects";

        let user = this.app.projectView.saveElement.user.value;
        let project = this.app.projectView.saveElement.project.value;
        if (user === "" || project === "") {
            this.app.projectView.saveElement.showError("Please fill in all fields");
            return;
        }
        this.projectUser = user;
        this.projectName = project;

        let jsonProject = await this.app.loader.saveProject();
        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": user,
                "projectName": project,
                "override": override,
                "data": jsonProject
            })
        });
        if (response.status === 201) {
            let json = await response.json();
            this.app.projectView.saveElement.showInfo("Project saved!");
            this.projectId = json.id;
            this.saved = true;
        }
        else if (response.status === 400) {
            let json = await response.json();
            let message = `Project "${project}", last edited : ${json.date}, already exists, do you want to override it?`;
            await this.saveProjectConfirm(user, project, jsonProject, message);
        }
    }

    async saveProjectConfirm(user: string, project: string, data: any, message: string = "") {
        let url = BACKEND_URL + "/projects";

        this.app.projectView.saveElement.showConfirm(message, async () => {
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": user,
                    "projectName": project,
                    "override": true,
                    "data": data
                })
            });
            if (response.status === 201) {
                let json = await response.json();
                this.app.projectView.saveElement.showInfo("Project saved!");
                this.projectId = json.id;
                this.saved = true;
            }
            else {
                this.app.projectView.saveElement.showError("Something went wrong");
            }
        });
    }

    async login() {
        if (!this.isLogged) {
            let url = BACKEND_URL + "/login";
            let user = this.app.projectView.loginElement.user.value;
            let password = this.app.projectView.loginElement.password.value;
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    "username": user,
                    "password": password
                })
            });
            if (response.status === 200) {
                this.isLogged = true;
                this.app.projectView.loginElement.showInfo("Login successful");
            }
            else if (response.status === 401) {
                this.app.projectView.loginElement.showError("Wrong username or password");
                this.app.projectView.loginElement.password.value = "";
            }
        }
        this.app.projectView.updateLogin(this.isLogged);
    }

    async logout() {
        if (this.isLogged) {
            let url = BACKEND_URL + "/logout";
            let response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.status === 200) {
                this.isLogged = false;
                this.app.projectView.loginElement.showInfo("Logout successful");
                this.app.projectView.loginElement.password.value = "";
            }
            else if (response.status === 401) {
                this.app.projectView.loginElement.showError("Logout failed");
            }
        }
        this.app.projectView.updateLogin(this.isLogged);
    }

    async isLoggedIn() {
        let url = BACKEND_URL + "/verify";
        let response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (response.status === 200) {
            this.isLogged = true;
        }
        else if (response.status === 401) {
            this.isLogged = false;
        }
    }


}