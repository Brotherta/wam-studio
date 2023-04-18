import App from "../App";


export default class ProjectController {

    app: App;
    saved: boolean = false;
    inProject: boolean = false;
    projectId: string = "";
    projectName: string = "";
    projectUser: string = "";

    constructor(app: App) {
        this.app = app;
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

    openNewProject() {
        this.app.projectView.mountNew();
        this.initNewProject();
        this.app.projectView.show();
    }

    openManageProject() {

    }

    async initSaveProject() {
        if (this.inProject) {
            this.app.projectView.saveElement.user.value = this.projectUser;
            this.app.projectView.saveElement.project.value = this.projectName;
            await this.saveProject(true);
        }

        if (!this.app.projectView.saveElement.initialized) {
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
                let url = process.env.BACKEND_URL + "/projects";
                let user = this.app.projectView.loadElement.userInput.value;
                let project = this.app.projectView.loadElement.projectInput.value;
                let query = "";
                if (user !== "" || project !== "") {
                    query = `/search?user=${user}&project=${project}`;
                }
                let response = await fetch(url + query);
                if (response.status === 200) {
                    let responseData = await response.json();
                    this.app.projectView.loadElement.addResults(responseData);
                }
            });

            this.app.projectView.loadElement.loadButton.addEventListener("click", async () => {
                if (this.app.projectView.loadElement.selectedProject !== "") {
                    let url = process.env.BACKEND_URL + "/projects/" + this.app.projectView.loadElement.selectedProject;
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
        }
    }

    async initNewProject() {
        if (!this.app.projectView.saveElement.initialized) {
            this.app.projectView.saveElement.initialized = true;
            this.app.projectView.saveElement.saveProjectButton.addEventListener("click", async () => {
                await this.saveProject();
            });
        }

        if (this.inProject && !this.saved) {
            this.app.projectView.saveElement.user.value = this.projectUser;
            this.app.projectView.saveElement.project.value = this.projectName;
            await this.saveProject(true);
        }

        await this.newProject();
        await this.saveProject();
    }

    async newProject() {
        await this.app.loader.loadProject({
            "tracks": [],
            "trackIdCount": 1,
        })
    }

    async saveProject(override: boolean = false) {
        let url = process.env.BACKEND_URL + "/projects";

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
        let url = process.env.BACKEND_URL + "/projects";

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

}