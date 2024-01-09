# Wam-Studio
Updated September 7, 2023

Wam-Studio’s is an online tool for creating audio projects that you can imagine as multi-track music. Each track corresponds to a different "layer" of audio content that can be recorded, edited, or just integrated (using audio files for example). Some track can be used to control virtual instruments: in that case we record the sound that is generated internally by these virtual instruments (and played using a MIDI piano keyboard, for example). Tracks can be added or removed, played isolated or with other tracks. They can also be "armed" for recording, and when the recording starts, all other tracks will play along, while the armed track will record new content.

Current features: robust audio track recording, track regions, loop area on tracks, track plugin fx chain, parameter automation, audio input and output device selection, latency measuring tool + inout latency compensation when recording, project saving on cloud (audio + all metadata), rendering mix with choice of tracks to render, viewport management on tracks (zoom in/out) using pixiJS/WebGL canvas.

<img width="800" alt="image" src="https://i.ibb.co/DkzGZrc/Wam-Studio-Sept2023.jpg">
### Citation

If you use our resource, please cite the following articles:

```
@inproceedings{buffa2023wam,
  title={WAM-studio, a Digital Audio Workstation (DAW) for the Web},
  author={Buffa, Michel and Vidal-Mazuy, Antoine},
  booktitle={Companion Proceedings of the ACM Web Conference 2023},
  pages={543--548},
  year={2023}
}
```
# Running guide

## Running the Application Locally

### Frontend
1. Navigate to the `public` folder.
2. Install dependencies by running `npm install`.
3. Create a `.env` file in the root directory of the `public` folder.
4. Configure the following variables in the `.env` file:
   - `PORT`: The port number that the frontend server will run on. For example, `5002`.
   - `HTTPS`: Set this to `true` if you want to enable HTTPS. If `true`, you must create a certificate and set the `SSL_CRT_FILE` and `SSL_KEY_FILE` variables.
   - `BACKEND_URL`: The URL of the backend server. For example, `http://localhost:6002`.
   - `BANK_PLUGIN_URL`: The URL of the bank plugin. For example, `http://localhost:6002`.
5. Start the frontend server by running `npm start`.

### Back-end (Bank Plugin)
1. Navigate to the `bank` folder.
2. Install dependencies by running `npm install`.
3. Create a `.env.local` file in the root directory of the `bank` folder.
4. Configure the following variables in the `.env.local` file:
   - `PORT`: The port number that the bank plugin server will run on. For example, `6002`.
   - `STORAGE_DIR`: The directory where the bank plugin will store data. For example, `storage`.
   - `ADMIN_PASSWORD`: The password for the admin user.
   - `JWT_SECRET`: The secret for JSON Web Tokens (JWT).
   - `NODE_ENV`: The environment that the bank plugin is running in. For example, `development`.
5. Start the bank plugin server by running `npm start`.

## Running the Application with Docker
1. Install Docker on your machine if you haven't already.
2. Clone the project repository to your local machine.
3. Navigate to the root directory of the project.
4. Start the application with Docker by running `docker-compose up`.
5. Docker will read the `docker-compose.yml` file to build and run the containers.
6. Configure the following variables in the `docker-compose.yml` file:
   - `HTTPS`: Set this to `false` to disable HTTPS. If `true`, you must create a certificate and set the `SSL_CRT_FILE` and `SSL_KEY_FILE`
   - `BACKEND_URL`: The URL of the backend server. For example, `http://localhost:6002`.
   - `BANK_PLUGIN_URL`: The URL of the bank plugin. For example, `http://localhost:7002`.
   - `STORAGE_DIR`: The directory where the backend will store data. For example, `/data/storage` (inside the volume).
   - `ADMIN_PASSWORD`: The password for the admin user.
   - `JWT_SECRET`: The secret for JSON Web Tokens (JWT).

Note : The server and the plugin bank can be hosted elsewhere, in that case do not forget to provide the URLs in the public `.env` or in the `docker-compose.yml`.

That's it! The application should now be running. You can access the frontend by going to `http://localhost:5002` in your web browser.
