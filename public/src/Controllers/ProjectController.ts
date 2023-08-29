import App from "../App";
import {BACKEND_URL} from "../Env";


export default class ProjectController {

    app: App;
    saved: boolean = true;
    projectId: string = "";
    projectName: string = "";
    projectUser: string = "";
    isLogged: boolean = false;

    constructor(app: App) {
        this.app = app;
        this.checkLogin();
    }

    async openSaveProject() {
        this.app.projectView.mountSave();
        this.initSaveProject();
        this.app.projectView.show();
    }

    async openLoadProject() {
        this.app.projectView.mountLoad();
        this.initLoadProject();
        this.app.projectView.show();
    }

    openExportProject() {
        this.app.projectView.mountExport();
        this.initExportProject();
        this.app.projectView.show();
    }

    async openLogin() {
        this.app.projectView.mountLogin();
        await this.initLogin();
        this.app.projectView.show();
    }

    initSaveProject() {
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

            this.app.projectView.loadElement.loadButton.addEventListener("click", async () => {
                await this.loadProject();
            });

            this.app.projectView.loadElement.deleteButton.addEventListener("click", async () => {
                await this.deleteProject();
            });

            this.app.projectView.loadElement.searchButton.addEventListener("click", async () => {
                await this.searchProject();
            });
        }
    }

    initExportProject() {
        let exportElement = this.app.projectView.exportElement;
        if (!exportElement.initialized) {
            exportElement.initialized = true;
            exportElement.exportBtn.addEventListener("click", async () => {
                let trackIds = exportElement.getSelectedTracks();
                let masterTrack = exportElement.isMasterTrackSelected();
                let name = exportElement.nameInput.value;
                await this.app.exportController.exportSongs(masterTrack, trackIds, name);
            });
        }
        exportElement.setTitle("export project");
        exportElement.update(this.app.tracksController.trackList);
    }

    initLogin() {
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

        let data = await this.app.loader.saveProject();
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
            this.projectId = json.id;
            this.uploadWav(json.id, wavs);
        }
        else if (response.status === 400 && !override) {
            let json = await response.json();
            let message = `Project "${project}", last edited : ${json.date}, already exists, do you want to override it?`;
            this.app.projectView.saveElement.showConfirm(message, async () => {
                await this.saveProject(true);
            });
        }
        else {
            this.app.projectView.saveElement.showError("Error while saving project");
        }
    }

    async searchProject() {
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
        else if (response.status === 400) {
            console.log("Something went wrong");
        }
    }

    async loadProject() {
        if (this.app.projectView.loadElement.selectedProject !== "") {
            let url = BACKEND_URL + "/projects/" + this.app.projectView.loadElement.selectedProject;
            let response = await fetch(url);
            if (response.status === 200) {
                let responseData = await response.json();

                this.projectId = responseData.id;
                this.projectName = responseData.project;
                this.projectUser = responseData.user;
                this.saved = true;
                await this.app.loader.loadProject(responseData);
                this.app.projectView.close();
            }
        }
    }

    async deleteProject() {
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

    async checkLogin() {
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
        this.app.projectView.login.innerText = this.isLogged ? "Log out" : "Log in";
    }

    uploadWav(projectId: string, wavs: { blob: Blob; name: string }[]) {
        let url = BACKEND_URL + "/projects/" + projectId + "/audio";

        let totalSize = wavs.reduce((sum, wav) => sum + wav.blob.size, 0);
        let loadedSizes = Array(wavs.length).fill(0);

        let uploadsRemaining = wavs.length;

        wavs.forEach((wav, index) => {
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
                    this.app.projectView.saveElement.progress(percentComplete, totalLoaded, totalSize);
                }
            });
            // Event listener for when the upload is done
            xhr.addEventListener('load', async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // When the audio has been uploaded
                    console.log(`Audio ${wav.name} uploaded to ${xhr.responseText}`);

                    uploadsRemaining--;
                    if (uploadsRemaining <= 0) {
                        this.app.projectView.saveElement.showInfo("Project saved!");
                        this.saved = true;
                        this.app.projectView.saveElement.progressDone(); // Hide the progress bar when all uploads are done
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


    /*    uploadWav(projectId: string, wavs: { blob: Blob; name: string }[]) {
            let url = BACKEND_URL + "/projects/" + projectId + "/audio";

            wavs.forEach((wav: any) => {
                let formData = new FormData();
                formData.append('audio', wav.blob, wav.name);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.withCredentials = true

                xhr.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = e.loaded / e.total;
                        console.log(`Audio ${wav.name} upload progress: ${percentComplete}%`);
                    }
                });

                // Event listener for when the upload is done
                xhr.addEventListener('load', async () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // When the audio has been uploaded
                        console.log(`Audio ${wav.name} uploaded to ${xhr.responseText}`);
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
        }*/
}