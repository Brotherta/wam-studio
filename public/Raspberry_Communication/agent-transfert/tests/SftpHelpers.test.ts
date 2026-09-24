import { describe, expect, it, vi } from "vitest";
import {
  finaliserUploadAtomiqueDistant,
  supprimerSiExiste,
  type ClientSftp,
} from "../src/scp/SftpHelpers";

function creerSftpMock(): ClientSftp & {
  unlink: ReturnType<typeof vi.fn>;
  rename: ReturnType<typeof vi.fn>;
  stat: ReturnType<typeof vi.fn>;
  readdir: ReturnType<typeof vi.fn>;
  rmdir: ReturnType<typeof vi.fn>;
} {
  return {
    mkdir: vi.fn((_chemin, callback) => callback(null)),
    unlink: vi.fn((_chemin, callback) => callback(null)),
    rename: vi.fn((_source, _destination, callback) => callback(null)),
    stat: vi.fn((_chemin, callback) => callback(Object.assign(new Error("No such file"), { code: 2 }))),
    readdir: vi.fn((_chemin, callback) => callback(null, [])),
    rmdir: vi.fn((_chemin, callback) => callback(null)),
    fastPut: vi.fn((_local, _distant, _options, callback) => callback(null)),
  };
}

describe("SftpHelpers", () => {
  it("ignore seulement l'absence de fichier lors de supprimerSiExiste", async () => {
    const sftp = creerSftpMock();
    sftp.unlink.mockImplementationOnce((_chemin, callback) => {
      callback(Object.assign(new Error("No such file"), { code: 2 }));
    });

    await expect(supprimerSiExiste(sftp, "/home/pi/sons/test.wav.part")).resolves.toBeUndefined();
    expect(sftp.unlink).toHaveBeenCalledTimes(1);
  });

  it("propage une erreur de permission lors de supprimerSiExiste", async () => {
    const sftp = creerSftpMock();
    sftp.unlink.mockImplementationOnce((_chemin, callback) => {
      callback(Object.assign(new Error("Permission denied"), { code: 3 }));
    });

    await expect(supprimerSiExiste(sftp, "/home/pi/sons/test.wav")).rejects.toMatchObject({ code: 3 });
  });

  it("supprime le fichier final existant avant le renommage atomique", async () => {
    const sftp = creerSftpMock();
    const part =
      "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav.part";
    const finalPath =
      "/home/pi/modulePre/PureData/compositions/skini/sons/son500.wav";

    await finaliserUploadAtomiqueDistant(sftp, part, finalPath);

    expect(sftp.unlink).toHaveBeenCalledWith(finalPath, expect.any(Function));
    expect(sftp.rename).toHaveBeenCalledWith(part, finalPath, expect.any(Function));
  });
});
