export default class WamAudioLoopBrowser extends HTMLElement {
    audioData: any = null;
    URL_SERVER: string;
    searchTimeout: any = null;
    constructor() {
        super();
        this.audioData = null;
        this.URL_SERVER = "https://wam-bank.i3s.univ-cotedazur.fr";
        console.log("before:",this.shadowRoot)
        this.attachShadow({ mode: "open" })
        console.log("after:",this.shadowRoot)
        //this.URL_SERVER = "http://localhost:6002";
    }


    connectedCallback() {
        this.init()
    }
    init() {
        this.shadowRoot!.innerHTML = /*html*/`
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css">
        <div id="mainWrapper">
            <div id="main">
                <a><h1>Sound Loops <i class="bi bi-arrow-repeat rotating"></i></h1></a>
                <br>
                <div id="search-container">
                    <i class="bi bi-search" id="search-icon"></i>
                    <input type="text" id="search-input" placeholder="  Search Library"/>
                </div><br>
                <div id="filter-container">
                    <div id="key-filter">
                        <label for="key-select">KEY :</label>
                        <select id="key-select">
                            <option value="">Any Key</option>
                            <option value="A">A</option>
                            <option value="A#">A♯</option>
                            <option value="B">B</option>
                            <option value="B#">B♯</option>
                            <option value="C">C</option>
                            <option value="C#">C♯</option>
                            <option value="D">D</option>
                            <option value="D#">D♯</option>
                            <option value="E">E</option>
                            <option value="E#">E♯</option>
                            <option value="F">F</option>
                            <option value="F#">F♯</option>
                            <option value="G">G</option>
                            <option value="G#">G♯</option>
                        </select>
                        <div id="key-mode-filter">
                        <select id="key-mode-select">
                            <option value="">Any Scale</option>
                            <option id="mode-maj" name="key-mode" value="Maj">Major</option>
                            <option id="mode-min" name="key-mode" value="Min">Minor</option>
                        </select>
                        </div>
                    </div>

                    <!-- BPM Filter -->
                    <div id="bpm-filter">
                        <label for="bpm-input">BPM :</label>
                        <input type="number" id="bpm-input" placeholder="BPM">
                        <button id="reset-filters-btn">X</button>
                    </div>
                </div>

                    <input type="checkbox" id="show-favorites" name="show-favorites">
                    <label for="show-favorites">Favorites</label><br><br>
                <div id="library-list">
                    <div id="favorites-container" style="display: none;">
                        <!-- Les morceaux favoris apparaîtront ici -->
                    </div>

                    <div id="folder-container"></div>
                    <div id="files-container"></div>

                    <div id="soundLoopsDiv"></div>
                </div>
            </div>
        </div>
        <style>
        #main {
            --primary-bg-color: #31353a; /* Couleur de fond primaire */
            --secondary-bg-color: #1c1e21; /* Couleur de fond secondaire */
            --text-color: #F8F9FA; /* Couleur du texte */
            --accent-color: #505dca; /* Couleur d'accent */
            --hover-bg-color: #505dca; /* Couleur de fond au survol */
          }

          #mainWrapper {
            width: 300px;
            height: 100vh;
            max-height: 100vh;
            font-size: 12px;
          }

          #main {
            user-select: none;
            background-color: var(--primary-bg-color);
            color: var(--text-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            height: auto;
        }
        h1{
            text-decoration: underline;

        }
        #library-list {
            height: 55vh;
            max-height: 100vh;
            overflow-y: scroll;
        }
        #library-list::-webkit-scrollbar {
            width: 12px;
        }

        ::-webkit-scrollbar-track {
            background-color: transparent;
        }

        ::-webkit-scrollbar-thumb {
            -webkit-border-radius: 10px;
            border-radius: 10px;
            background: #777;
        }

          h1 {
            color: var(--accent-color);
            text-align: center;
            margin:0;
          }

          #search-container {
            display: flex;
            padding-left: 0.5rem;
            align-items: center;
            position: relative;
            margin-bottom: 1rem;
          }

          #search-icon {
            color: var(--accent-color);
            position: absolute;
            left: 1rem;
          }

          #search-input {
            flex-grow: 1;
            padding: 0.5rem 2rem;
            font-size: 1rem;
            border: none;
            border-radius: 20px;
            margin-right: 1rem;
            background-color: var(--secondary-bg-color);
            color: var(--text-color);
          }

          #folder-container {
            user-select: none;
            display: flex;
            flex-direction: column;
            margin-bottom: 1rem;
          }

          .folder-btn {
            background-color: var(--secondary-bg-color);
            color: var(--text-color);
            border: none;
            border-radius: 5px;
            padding: 0.5rem 1rem;
            margin: 0;
            cursor: pointer;
            transition: background-color 0.2s;
            text-align: left;
          }

          .folder-btn:hover {
            background-color: var(--hover-bg-color);
          }

          #files-container {
            display: flex;
            overflow: hidden;
            flex-direction: column;
            gap: 0.5rem;
          }

          .folder > .nested {
            display: none;
            margin-left: 0.5rem;
          }

          .folder > .nested.show {
            display: block;
          }
          .folder-title {
            cursor: pointer;
          }

            .folder-icon {
            margin-left: 0.5rem;
            font-size: 18px;
            }

          .audio-file-item {
            background-color: var(--secondary-bg-color);
            flex-grow: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            border-radius: 5px;
            padding: 0.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .play-btn,
          .favourite-btn,
          .download-btn,
          .add-btn {
            font-size: 16px;
            background: none;
            border: none;
            padding: 0.5rem;
            color: var(--accent-color);
            cursor: pointer;
            transition: transform 0.2s;
          }

          .play-btn:hover,
          .favourite-btn:hover,
          .download-btn:hover,
          .add-btn:hover {
            transform: scale(1.1);
          }

          .bi-heart-fill {
            color: red;
          }

          .file-name {
            user-select: none;
            flex-grow: 1;
            margin-right: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          #filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            padding: 1rem;
            background-color: var(--secondary-bg-color);
            border-radius: 10px;
            margin-bottom: 1rem;
          }

          select, input[type="number"],option[name="key-mode"] {
            padding: 0.5rem;
            border-radius: 5px;
            border: 1px solid var(--accent-color);
            background-color: var(--primary-bg-color);
            color: var(--text-color);
          }

          select:focus, input[type="number"]:focus {
            outline: none;
            border-color: var(--accent-color);
          }

          label {
            color: var(--text-color);
          }

          button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 5px;
            background-color: var(--accent-color);
            color: var(--text-color);
            cursor: pointer;
            transition: background-color 0.2s;
          }

          button:hover {
            background-color: darken(var(--accent-color), 60%);
          }

          #key-filter {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          #key-mode-filter {
            display: flex;
            align-items: center;
            gap: 0.5rem; /
          }

          #reset-filters-btn:hover{
            background-color: red;
          }

          #favorites-container .audio-file-item {
            margin-bottom: 0.5rem;
          }

          #favorites-container {
            display: none;
            margin-bottom: 1rem;
          }



        </style>

    `;

        fetch(this.URL_SERVER + "/api/audioloops")
            .then((response) => response.json())
            .then((data) => {
                this.audioData = data;

                const folderContainer = this.shadowRoot!.getElementById('folder-container') as HTMLElement;
                this.generateStructure(this.audioData, folderContainer);

                const searchInput = this.shadowRoot?.getElementById('search-input') as HTMLInputElement;
                searchInput?.addEventListener('input', () => this.handleSearchAndFilter());

                const keySelect = this.shadowRoot?.getElementById('key-select') as HTMLSelectElement;
                keySelect?.addEventListener('change', () => this.handleSearchAndFilter());

                const keyModeSelect = this.shadowRoot?.getElementById('key-mode-select') as HTMLSelectElement;
                keyModeSelect?.addEventListener('change', () => this.handleSearchAndFilter());

                const bpmInput = this.shadowRoot?.getElementById('bpm-input') as HTMLInputElement;
                bpmInput?.addEventListener('input', () => this.handleSearchAndFilter());

                let resetFiltersBtn = this.shadowRoot!.getElementById('reset-filters-btn') as HTMLButtonElement;
                resetFiltersBtn.addEventListener('click', () => this.resetDisplay());

                let showFavoritesCheckbox = this.shadowRoot!.getElementById('show-favorites') as HTMLInputElement;
                showFavoritesCheckbox.addEventListener('change', (event) => {
                    const favoritesContainer = this.shadowRoot!.getElementById('favorites-container') as HTMLElement;
                    const filesContainer = this.shadowRoot!.getElementById('files-container') as HTMLElement;

                    const target = event.target as HTMLInputElement;
                    if (target.checked) {
                        favoritesContainer.style.display = 'block';
                        folderContainer.style.display = 'none';
                        filesContainer.style.display = 'none';
                    } else {
                        favoritesContainer.style.display = 'none';
                        folderContainer.style.display = 'block';
                        filesContainer.style.display = 'block';
                    }
                });
                this.attachFavouriteButtonEventListeners();
                this.updateFavoritesDisplay();
                this.initFavouriteIcons();
            })
            .catch((error) => {
                console.error("Error fetching audio data:", error);
            });
    }
    handleSearchAndFilter() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.performSearchAndFilter();
        }, 300); // Throttling avec un délai de 300ms
    }
    performSearchAndFilter(): void {
        const searchTerm = (this.shadowRoot!.getElementById('search-input') as HTMLInputElement).value.toLowerCase();
        const selectedKey = (this.shadowRoot!.getElementById('key-select') as HTMLSelectElement).value;
        const selectedMode = (this.shadowRoot!.getElementById('key-mode-select') as HTMLSelectElement).value;
        const bpm = (this.shadowRoot!.getElementById('bpm-input') as HTMLInputElement).value;

        const folderContainer = this.shadowRoot!.getElementById('folder-container') as HTMLElement;
        const filesContainer = this.shadowRoot!.getElementById('files-container') as HTMLElement;

        if (searchTerm === '' && !selectedKey && !selectedMode && !bpm) {
            // this.resetFoldersAndFilesDisplay();
            folderContainer.style.display = 'block';
            filesContainer.innerHTML = '';
            return;
        }

        folderContainer.style.display = 'none';
        this.searchAndFilterFoldersKeyBpm(this.audioData.children, filesContainer, selectedKey, selectedMode, bpm);

        if (searchTerm) {
            const filteredItems = Array.from(filesContainer.querySelectorAll('.audio-file-item')) as HTMLElement[];
            filteredItems.forEach(item => {
                const filenameAttribute = item.getAttribute('data-filename');
                const title = filenameAttribute ? filenameAttribute.toLowerCase() : '';
                item.style.display = title.includes(searchTerm) ? 'flex' : 'none';
            });
        } else {
            if (!selectedKey && !selectedMode && !bpm) {
                this.resetFoldersAndFilesDisplay();
                folderContainer.style.display = 'block';
                filesContainer.innerHTML = '';
            }
        }

        this.attachPlayButtonEventListeners();
        this.attachDragListeners();
    }

    attachDragListeners() {
        this.shadowRoot!.querySelectorAll(".audio-file-item").forEach((audioLoopDiv) => {
            audioLoopDiv.addEventListener("dragstart", this.dragHandler);
        });
    }

    attachPlayButtonEventListeners(): void {
        const playButtons = this.shadowRoot!.querySelectorAll('.play-btn');

        playButtons.forEach((buttonElement: Element) => {
            const button = buttonElement as HTMLButtonElement;

            button.addEventListener('click', (event: Event) => {
                const target = event.target as HTMLButtonElement;
                const audioItem = target.closest('.audio-file-item');

                if (audioItem) {
                    const audio = audioItem.querySelector('audio') as HTMLAudioElement;

                    if (audio) {
                        const audioId = audio.id;
                        this.setAudioPriorityAndPlay(audioId);
                    }
                }
            });
        });
    }
    attachFavouriteButtonEventListeners() {
        const favouriteButtons = this.shadowRoot!.querySelectorAll('.favourite-btn') as NodeListOf<HTMLButtonElement>;
        favouriteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const fullPath = button.parentElement?.getAttribute('data-fullpath') as string;
                this.toggleFavourite(fullPath, button);
            });
        });
    }
    toggleFolder(folderElement: { querySelector: (arg0: string) => any; }) {
        const sublist = folderElement.querySelector('.nested');
        if (sublist) {
            sublist.classList.toggle('show');
        }
    }
    generateStructure(data: any, container: HTMLElement, currentPath: string = ''): void {
        data.children.forEach((element: any) => {
            let item: HTMLDivElement | null = null;

            if (element.type === 'folder') {
                let folderPath: string = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
                let fullPath: string = `${folderPath}${element.name}`;

                item = document.createElement("div");
                item.classList.add('folder');
                item.style.display = 'block';

                const folderTitle: HTMLDivElement = document.createElement("div");
                folderTitle.classList.add('folder-title');
                folderTitle.innerHTML = `
                    <span class='folder-icon'><i class="bi bi-folder"></i></span>
                    <span>${element.name}</span>
                `;

                folderTitle.addEventListener('click', () => {
                    if (item !== null) {
                        this.toggleFolder(item);
                    }
                });

                item.appendChild(folderTitle);

                const subList: HTMLDivElement = document.createElement("div");
                subList.classList.add('nested');
                this.generateStructure(element, subList, fullPath);
                item.appendChild(subList);
            } else if (element.type === "file") {
                item = document.createElement("div");
                item.innerHTML = this.createAudioPlayer(element);
                item.querySelectorAll(".audio-file-item").forEach((audioLoopDiv) => {
                    audioLoopDiv.addEventListener("dragstart", this.dragHandler);
                });

            }
            if (item !== null && container !== null) {
                container.appendChild(item);
            }
        });
    }
    resetFoldersAndFilesDisplay() {
        const folderContainer = this.shadowRoot!.getElementById('folder-container') as HTMLElement;
        const filesContainer = this.shadowRoot!.getElementById('files-container') as HTMLElement;

        folderContainer.innerHTML = '';
        filesContainer.innerHTML = '';
        this.generateStructure(this.audioData,folderContainer);
        this.attachFavouriteButtonEventListeners();
    }
    resetDisplay() {
        (this.shadowRoot!.getElementById('key-select') as HTMLSelectElement).value = '';
        (this.shadowRoot!.getElementById('key-mode-select') as HTMLSelectElement).value = '';
        (this.shadowRoot!.getElementById('bpm-input') as HTMLInputElement).value = '';
        (this.shadowRoot!.getElementById('search-input') as HTMLInputElement).value = '';
        const folderContainer = this.shadowRoot!.getElementById('folder-container') as HTMLElement;
        folderContainer.style.display = 'block';
        const filesContainer = this.shadowRoot!.getElementById('files-container') as HTMLElement;
        filesContainer.innerHTML = '';
    }
    filterFile(file: { name: any; }, selectedKey: string, selectedMode: string, bpm: string) {
        const fileName = file.name;
        const fileBpmMatch = fileName.match(/\d+bpm/i);
        const fileBpm = fileBpmMatch ? parseInt(fileBpmMatch[0].replace('bpm', ''), 10) : null;
        const fileKeyMatch = fileName.match(/[A-G]#?(maj|min)/i);
        const fileKey = fileKeyMatch ? fileKeyMatch[0].toLowerCase() : null;

        const matchesKey = selectedKey ? fileKey && fileKey.startsWith(selectedKey.toLowerCase()) : true;
        const matchesMode = selectedMode ? fileKey && fileKey.endsWith(selectedMode.toLowerCase()) : true;
        const matchesBpm = bpm ? fileBpm === parseInt(bpm, 10) : true;

        return matchesKey && matchesMode && matchesBpm;
    }
    searchAndFilterFoldersKeyBpm(folders: any[], containerElement: Element, selectedKey: string, selectedMode: string, bpm: string): void {
        let htmlContent = '';

        const processFolder = (folderItems: any[]) => {
            folderItems.forEach(item => {
                if (item.type === 'folder') {
                    if (item.children && item.children.length > 0) {
                        processFolder(item.children);
                    }
                } else if (item.type === 'file') {
                    const fileMatches = this.filterFile(item, selectedKey, selectedMode, bpm);
                    if (fileMatches) {
                        const fileItem = this.createAudioPlayer(item, false, true);
                        htmlContent += fileItem;
                    }
                }
            });
        };
        processFolder(folders);
        if (htmlContent) {
            containerElement.innerHTML = htmlContent;
        }
        this.attachFavouriteButtonEventListeners();
        this.attachPlayButtonEventListeners();
    }
    initFavouriteIcons(): void {
        const favouriteButtons = this.shadowRoot?.querySelectorAll('.favourite-btn');
        const favourites: string[] = JSON.parse(localStorage.getItem('favourites') || '[]');

        favouriteButtons?.forEach((button: Element) => {
            const fullPath = button.parentElement?.getAttribute('data-fullpath');
            const heartIcon = button.querySelector('i');
            if (fullPath && favourites.includes(fullPath)) {
                heartIcon?.classList.add('bi-heart-fill');
                heartIcon?.classList.remove('bi-heart');
            } else {
                heartIcon?.classList.remove('bi-heart-fill');
                heartIcon?.classList.add('bi-heart');
            }
        });
    }
    toggleFavourite(fullPath: string, buttonElement: HTMLElement): void {
        let favourites: string[] = JSON.parse(localStorage.getItem('favourites') || '[]');
        const heartIcon = buttonElement.querySelector('i') as HTMLElement;

        const isFavourite = favourites.includes(fullPath);

        if (isFavourite) {
            favourites = favourites.filter(fav => fav !== fullPath);
            heartIcon.classList.remove('bi-heart-fill');
            heartIcon.classList.add('bi-heart');
        } else {
            favourites.push(fullPath);
            heartIcon.classList.add('bi-heart-fill');
            heartIcon.classList.remove('bi-heart');
        }

        localStorage.setItem('favourites', JSON.stringify(favourites));

        this.updateFavoritesDisplay();
    }
    updateFavoritesDisplay(): void {
        const favoritesContainer = this.shadowRoot?.getElementById('favorites-container') as HTMLElement;
        const favorites: string[] = JSON.parse(localStorage.getItem('favourites') || '[]');

        favoritesContainer.innerHTML = '';

        favorites.forEach((fullPath: string) => {
            const fileObject = this.findFileObjectByFullPath(fullPath, this.audioData.children);
            if (fileObject) {
                const audioPlayerHtml = this.createAudioPlayer(fileObject, true, false);

                favoritesContainer.innerHTML += audioPlayerHtml;

            }
        });

        this.attachPlayButtonEventListeners();
    }
    findFileObjectByFullPath(fullPath: string, children: any) {
        for (const item of children) {
            const path = this.URL_SERVER + (encodeURI(item.url).replace(/#/g, '%23'));
            if (item.type === 'file' && (path === fullPath)) {
                return item;
            } else if (item.type === 'folder') {
                const result = this.findFileObjectByFullPath(fullPath, item.children) as any;
                if (result) return result;
            }
        }
        return null;
    }
    togglePlayPause(audioId: string): void {
        const audio = this.shadowRoot!.querySelector(`#${audioId}`) as HTMLAudioElement;
        if (!audio) {
            console.error("Élément audio introuvable:", audioId);
            return;
        }

        const playBtn = audio.closest('.audio-file-item')?.querySelector('.play-btn') as HTMLButtonElement;
        if (!playBtn) {
            console.error("Bouton de lecture introuvable pour l'audio:", audioId);
            return;
        }

        this.shadowRoot?.querySelectorAll('audio').forEach((otherAudio: HTMLAudioElement) => {
            const otherAudioItem = otherAudio.closest('.audio-file-item') as HTMLElement;
            if (otherAudio.id !== audioId && !otherAudio.paused) {
                otherAudio.pause();
                const otherPlayBtn = otherAudioItem.querySelector('.play-btn') as HTMLButtonElement;
                otherPlayBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
            }
        });

        const isPlaying = !audio.paused;
        if (isPlaying) {
            audio.pause();
            playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        } else {
            audio.play();
            playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        }
    }
    setAudioPriorityAndPlay(audioId: string) {
        const audioElement = this.shadowRoot!.querySelector(`#${audioId}`) as HTMLElement;
        if (audioElement) {
            (audioElement.parentElement as HTMLElement).setAttribute('data-loading-priority', 'high');

            this.shadowRoot!.querySelectorAll('.audio-file-item[data-loading-priority="high"]').forEach(item => {
                if (item.id !== (audioElement.parentElement as HTMLElement).id) {
                    item.setAttribute('data-loading-priority', 'low');
                }
            });

            this.togglePlayPause(audioId);
        }
    }
    createAudioPlayer(element: any, isFavorite: boolean = false, isFilter: boolean = false): string {
        const safeName = element.name.replace(/\W+/g, '-');
        const audioIdSuffix = isFavorite ? '-fav' : (isFilter ? '-filter' : '');
        const audioId = `audio-${safeName}${audioIdSuffix}`;
        const durationId = `duration-${safeName}`;
        const fileExtension = element.name.split('.').pop();
        const fullPath = this.URL_SERVER + encodeURI(element.url).replace(/#/g, '%23');
        const fileNameWithoutExtension = element.name.replace(new RegExp(`\.${fileExtension}$`), '');

        return `
            <div draggable=true  class="audio-file-item" data-filename="${element.name}"
            data-fullpath="${fullPath}">
                <button class="play-btn">
                    <i class="bi bi-play-fill"></i>
                </button>
                <span class="file-name">${fileNameWithoutExtension}</span>
                <span class="audio-duration" id="${durationId}"></span>
                <audio id="${audioId}" preload="none">
                    <source src="${fullPath}" type="audio/${fileExtension}">
                </audio>
                <button class="favourite-btn">
                    <i class="bi bi-heart"></i>
                </button>
                <button class="download-btn" onclick="window.open('${fullPath}')">
                    <i class="bi bi-plus-circle"></i>
                </button>
            </div>
        `;
    }

    dragHandler = (event: any) => {
        console.log(event.target.dataset.fullpath);
        // copy to datatransfer
        event.dataTransfer.setData("audioFileURL", event.target.dataset.fullpath);
    }
}

window.customElements.define('wam-audio-loop-browser', WamAudioLoopBrowser);