import App from "../App";
import {BACKEND_URL} from "../Env";
import ProjectView from "../Views/ProjectView";

/**
 * Controller for the project window. Handles saving, loading, exporting and logging in.
 */
export default class ProjectController {

    /**
     * Application instance.
     */
    private _app: App;
    /**
     * View instance of the project window.
     */
    private _view: ProjectView;
    /**
     * Whether the user is logged in or not.
     */
    private _logged: boolean = false;

    constructor(app: App) {
        this._app = app;
        this._view = this._app.projectView;
        this.checkLogin();
        this._view.closeBtn.addEventListener("click", () => this._view.close());
    }

    /**
     * Mounts the project window and shows the save project view.
     * Binds the save project events.
     */
    public openSaveWindow(): void {
        this._view.mountSave();
        this.bindSaveEvents();
        this._view.show();

    }

    /**
     * Mounts the project window and shows the load project view.
     * Binds the load project events.
     */
    public openLoadWindow(): void {
        this._view.mountLoad();
        this.bindLoadEvents();
        this._view.show();
    }

    /**
     * Mounts the project window and shows the export project view.
     * Binds the export project events.
     */
    public openExportWindow(): void {
        this._view.mountExport();
        this.bindExportEvents();
        this._view.show();
    }

    /**
     * Mounts the project window and shows the login view.
     * Binds the login events.
     */
    public openLoginWindow(): void {
        this._view.mountLogin();
        this.bindLoginEvents();
        this._view.show();
    }

    /**
     * If the save element is not initialized, it will be initialized and the save button will be bound.
     * @private
     */
    private bindSaveEvents(): void {
        if (!this._view.saveElement.initialized) {
            this._view.saveElement.initialized = true;
            this._view.saveElement.saveProjectButton.addEventListener("click", async () => {
                await this.saveProject();
            });
        }
    }

    /**
     * If the load element is not initialized, it will be initialized and the load, delete and search buttons will be bound.
     * @private
     */
    private bindLoadEvents(): void {
        if (!this._view.loadElement.initialized) {
            this._view.loadElement.initialized = true;

            this._view.loadElement.loadButton.addEventListener("click", async () => {
                await this.loadProject();
            });

            this._view.loadElement.deleteButton.addEventListener("click", async () => {
                await this.deleteProject();
            });

            this._view.loadElement.searchButton.addEventListener("click", async () => {
                await this.searchProject();
            });
        }
    }

    /**
     * If the export element is not initialized, it will be initialized and the export button will be bound.
     * @private
     */
    private bindExportEvents(): void {
        let exportElement = this._view.exportElement;
        if (!exportElement.initialized) {
            exportElement.initialized = true;
            exportElement.exportBtn.addEventListener("click", async () => {
                let trackIds = exportElement.getSelectedTracks();
                let masterTrack = exportElement.isMasterTrackSelected();
                let name = exportElement.nameInput.value;
                await this._app.exportController.exportSongs(masterTrack, trackIds, name);
            });
        }
        exportElement.setTitle("export project");
        exportElement.update([...this._app.tracksController.sampleTracks]);
    }

    /**
     * If the login element is not initialized, it will be initialized and the login and logout buttons will be bound.
     * @private
     */
    private bindLoginEvents(): void {
        if (!this._view.loginElement.initialized) {
            this._view.loginElement.initialized = true;

            this._view.loginElement.logInButton.addEventListener("click",  () => {
                this.login();
            });

            this._view.loginElement.logOutButton.addEventListener("click",  () => {
                this.logout();
            });
        }
        this._view.updateLogin(this._logged);
    }

    /**
     * Save the project to the backend. If the project already exists, the user will be asked if he wants to override it.
     * If the user accepts, the project will be saved with the override flag set to true.
     *
     * @param override - Whether the project should be overridden or not.
     * @private
     */
    private async saveProject(override: boolean = false): Promise<void> {
        let url = BACKEND_URL + "/projects";

        let user = this._view.saveElement.user.value;
        let project = this._view.saveElement.project.value;
        if (user === "" || project === "") {
            this._view.saveElement.showError("Please fill in all fields");
            return;
        }

        let data = await this._app.loader.saveProject();
        let wavs = data.wavs;

        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "username": user,
                "projectName": project,
                "override": override,
                "data": data.project
            })
        });
        if (response.status === 201) {
            let json = await response.json();
            this.uploadWav(json.id, wavs);
        }
        else if (response.status === 400 && !override) {
            let json = await response.json();
            let message = `Project "${project}", last edited : ${json.date}, already exists, do you want to override it?`;
            this._view.saveElement.showConfirm(message, async () => {
                await this.saveProject(true);
            });
        }
        else {
            this._view.saveElement.showError("Error while saving project");
        }
    }

    /**
     * Searches for the project in the backend and adds the results to the load view.
     * If the user and project fields are empty, all projects will be returned.
     * @private
     */
    private async searchProject(): Promise<void> {
        let url = BACKEND_URL + "/projects";
        let user = this._view.loadElement.userInput.value;
        let project = this._view.loadElement.projectInput.value;
        let query = "";
        if (user !== "" || project !== "") {
            query = `/search?user=${user}&project=${project}`;
        }
        let response = await fetch(url + query, {
            credentials: "include"
        });
        if (response.status === 200) {
            let responseData = await response.json();
            this._view.loadElement.addResults(responseData);
        }
        else if (response.status === 400) {
            console.log("Something went wrong");
        }
    }

    /**
     * Loads the project from the backend. If the project does not exist, an error will be shown.
     * It loads the project from the backend and then calls the loader to load the project.
     * @private
     */
    private async loadProject(): Promise<void> {
        if (this._view.loadElement.selectedProject !== "") {
            let url = BACKEND_URL + "/projects/" + this._view.loadElement.selectedProject;
            let response = await fetch(url);
            if (response.status === 200) {
                let responseData = await response.json();
                await this._app.loader.loadProject(responseData);
                this._view.close();
            }
        }
    }

    /**
     * Deletes the project from the backend. If the project does not exist, an error will be shown.
     * @private
     */
    private async deleteProject(): Promise<void> {
        if (this._view.loadElement.selectedProject !== "") {
            let url = BACKEND_URL + "/projects/" + this._view.loadElement.selectedProject;
            let response = await fetch(url, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.status === 200) {
                this._view.loadElement.selectedProject = "";
                this._view.loadElement.userInput.value = "";
                this._view.loadElement.projectInput.value = "";
                this._view.loadElement.searchButton.click();
            }
        }
    }

    /**
     * Logins the user to the backend. If the user is already logged in, nothing will happen.
     * If the user is not logged in, the user and password fields will be read and a request will be sent to the backend.
     * @private
     */
    private login(): void {
        if (this._logged) return
        let url = BACKEND_URL + "/login";
        let user = this._view.loginElement.user.value;
        let password = this._view.loginElement.password.value;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                "username": user,
                "password": password
            })
        }).then(response => {
            if (response.status === 200) {
                this._logged = true;
                this._view.loginElement.showInfo("Login successful");
            }
            else if (response.status === 401) {
                this._view.loginElement.showError("Wrong username or password");
                this._view.loginElement.password.value = "";
            }

            this._view.updateLogin(this._logged);
        });
    }

    /**
     * Logouts the user from the backend. If the user is not logged in, nothing will happen.
     * @private
     */
    private logout(): void {
        if (!this._logged) return;
        let url = BACKEND_URL + "/logout";
        fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.status === 200) {
                this._logged = false;
                this._view.loginElement.showInfo("Logout successful");
                this._view.loginElement.password.value = "";
            }
            else if (response.status === 401) {
                this._view.loginElement.showError("Logout failed");
            }
            this._view.updateLogin(this._logged);
        });
    }

    /**
     * Checks if the user is logged in and updates the login button accordingly.
     * @private
     */
    private checkLogin(): void {
        let url = BACKEND_URL + "/verify";
        fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            this._logged = response.status === 200;
            this._view.login.innerText = this._logged ? "Log out" : "Log in";
        })
    }

    /**
     * Uploads the waves files to the backend. If the upload is successful, the project will be saved.
     *
     * @param projectId - The id of the project.
     * @param waves - The waves to upload.
     * @private
     */
    private uploadWav(projectId: string, waves: { blob: Blob; name: string }[]): void {
        let url = BACKEND_URL + "/projects/" + projectId + "/audio";

        let totalSize = waves.reduce((sum, wav) => sum + wav.blob.size, 0);
        let loadedSizes = Array(waves.length).fill(0);

        let uploadsRemaining = waves.length;

        waves.forEach((wav, index) => {
            let formData = new FormData();
            formData.append('audio', wav.blob, wav.name);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.withCredentials = true

            xhr.upload.addEventListener('progress', (e) => {
                console.log('progress');
                if (e.lengthComputable) {
                    loadedSizes[index] = e.loaded;  // store the loaded bytes for this file
                    let totalLoaded = loadedSizes.reduce((sum, loaded) => sum + loaded, 0);  // calculate the total loaded bytes for all files
                    let percentComplete = totalLoaded / totalSize * 100;
                    console.log(`Total upload progress: ${percentComplete}%`);

                    // Assuming 'saveProjectElement' is the reference to your SaveProjectElement instance
                    this._view.saveElement.progress(percentComplete, totalLoaded, totalSize);
                }
            });
            // Event listener for when the upload is done
            xhr.addEventListener('load', async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // When the audio has been uploaded
                    console.log(`Audio ${wav.name} uploaded to ${xhr.responseText}`);

                    uploadsRemaining--;
                    if (uploadsRemaining <= 0) {
                        this._view.saveElement.showInfo("Project saved!");
                        this._view.saveElement.progressDone(); // Hide the progress bar when all uploads are done
                    }
                } else {
                    // If the request failed
                    console.log(`Failed to upload audio ${wav.name}: ${xhr.statusText}`);
                }
            });

            // Error listener
            xhr.addEventListener('error', () => {
                console.log(`Failed to upload audio ${wav.name}: ${xhr.statusText}`);
            });

            xhr.send(formData);
        });
    }
}