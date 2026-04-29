import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FiCamera, FiCheck, FiSave, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { AppHeader } from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { auth, firestore, storage } from "../firebase/firebase";

const CROP_OUTPUT_SIZE = 1024;

const fieldClassName =
  "w-full border-0 border-b border-[#d6d9dc] bg-transparent px-0 py-3 text-[14px] leading-[20px] text-[#071735] outline-none placeholder:text-[#8b94a3] focus:border-[#167307]";

const labelClassName = "mb-2 block text-[12px] font-medium uppercase tracking-[0.16em] text-[#52606d]";

type CropDimensions = {
  width: number;
  height: number;
};

type CropOffset = {
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const loadImage = (sourceUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    image.src = sourceUrl;
  });

const getCropBounds = (
  dimensions: CropDimensions | null,
  frameSize: number,
  zoom: number
) => {
  if (!dimensions || frameSize <= 0) {
    return {
      maxOffsetX: 0,
      maxOffsetY: 0,
    };
  }

  const baseScale = Math.max(frameSize / dimensions.width, frameSize / dimensions.height);
  const renderedWidth = dimensions.width * baseScale * zoom;
  const renderedHeight = dimensions.height * baseScale * zoom;

  return {
    maxOffsetX: Math.max(0, ((renderedWidth - frameSize) / 2 / frameSize) * 100),
    maxOffsetY: Math.max(0, ((renderedHeight - frameSize) / 2 / frameSize) * 100),
  };
};

const clampOffset = (offset: CropOffset, dimensions: CropDimensions | null, frameSize: number, zoom: number) => {
  const bounds = getCropBounds(dimensions, frameSize, zoom);

  return {
    x: clamp(offset.x, -bounds.maxOffsetX, bounds.maxOffsetX),
    y: clamp(offset.y, -bounds.maxOffsetY, bounds.maxOffsetY),
  };
};

const createCroppedAvatarFile = async ({
  sourceUrl,
  fileName,
  dimensions,
  frameSize,
  zoom,
  offset,
}: {
  sourceUrl: string;
  fileName: string;
  dimensions: CropDimensions;
  frameSize: number;
  zoom: number;
  offset: CropOffset;
}) => {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement("canvas");
  canvas.width = CROP_OUTPUT_SIZE;
  canvas.height = CROP_OUTPUT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Não foi possível preparar o recorte da foto.");
  }

  const baseScale = Math.max(frameSize / dimensions.width, frameSize / dimensions.height);
  const renderedWidth = dimensions.width * baseScale * zoom;
  const renderedHeight = dimensions.height * baseScale * zoom;
  const scaleToOutput = CROP_OUTPUT_SIZE / frameSize;
  const drawWidth = renderedWidth * scaleToOutput;
  const drawHeight = renderedHeight * scaleToOutput;
  const offsetX = (offset.x / 100) * CROP_OUTPUT_SIZE;
  const offsetY = (offset.y / 100) * CROP_OUTPUT_SIZE;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    CROP_OUTPUT_SIZE / 2 - drawWidth / 2 + offsetX,
    CROP_OUTPUT_SIZE / 2 - drawHeight / 2 + offsetY,
    drawWidth,
    drawHeight
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("Não foi possível gerar a imagem recortada."));
        return;
      }

      resolve(result);
    }, "image/jpeg", 0.92);
  });

  const sanitizedName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-") || "avatar.jpg";

  return new File([blob], sanitizedName.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
};

const TelaPerfil = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState("");
  const [cropFileName, setCropFileName] = useState("");
  const [cropDimensions, setCropDimensions] = useState<CropDimensions | null>(null);
  const [cropFrameSize, setCropFrameSize] = useState(320);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) {
        URL.revokeObjectURL(sourceUrlRef.current);
        sourceUrlRef.current = null;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setFullName(profile?.fullName ?? user?.displayName ?? "");
    setPhone(profile?.phone ?? "");
    setCity(profile?.city ?? "");
    setState(profile?.state ?? "");
    setBio(profile?.bio ?? "");
    setPhotoURL(profile?.photoURL ?? user?.photoURL ?? "");
  }, [profile, user]);

  const initials = useMemo(() => {
    const source = fullName.trim() || user?.email?.split("@")[0] || "";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [fullName, user]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    sourceUrlRef.current = objectUrl;

    setCropSourceUrl(objectUrl);
    setCropFileName(file.name);
    setCropDimensions(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropOpen(true);
    event.target.value = "";
  };

  const closeCropModal = () => {
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = null;
    }

    dragStateRef.current = null;
    setIsDragging(false);
    setCropOpen(false);
    setCropSourceUrl("");
    setCropFileName("");
    setCropDimensions(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
  };

  const applyCrop = async () => {
    if (!user || !cropSourceUrl || !cropDimensions) {
      return;
    }

    setIsCropping(true);
    setErrorMessage("");

    try {
      const croppedFile = await createCroppedAvatarFile({
        sourceUrl: cropSourceUrl,
        fileName: cropFileName || "avatar.jpg",
        dimensions: cropDimensions,
        frameSize: cropFrameSize,
        zoom: cropZoom,
        offset: cropOffset,
      });

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const previewUrl = URL.createObjectURL(croppedFile);
      previewUrlRef.current = previewUrl;

      setPhotoFile(croppedFile);
      setPhotoURL(previewUrl);
      closeCropModal();
    } catch {
      setErrorMessage("Não foi possível recortar a imagem. Tente outra foto.");
    } finally {
      setIsCropping(false);
    }
  };

  useEffect(() => {
    if (!cropOpen) {
      return undefined;
    }

    const element = cropFrameRef.current;

    if (!element) {
      return undefined;
    }

    const updateFrameSize = () => {
      setCropFrameSize(element.clientWidth || 320);
    };

    updateFrameSize();

    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [cropOpen]);

  useEffect(() => {
    setCropOffset((current) => clampOffset(current, cropDimensions, cropFrameSize, cropZoom));
  }, [cropDimensions, cropFrameSize, cropZoom]);

  const handleCropPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cropDimensions) {
      return;
    }

    event.preventDefault();

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: cropOffset.x,
      originY: cropOffset.y,
    };

    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStateRef.current) {
        return;
      }

      const deltaX = ((moveEvent.clientX - dragStateRef.current.startX) / cropFrameSize) * 100;
      const deltaY = ((moveEvent.clientY - dragStateRef.current.startY) / cropFrameSize) * 100;

      setCropOffset(
        clampOffset(
          {
            x: dragStateRef.current.originX + deltaX,
            y: dragStateRef.current.originY + deltaY,
          },
          cropDimensions,
          cropFrameSize,
          cropZoom
        )
      );
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let uploadedPhotoURL = photoURL;

      if (photoFile) {
        const fileName = photoFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const storageRef = ref(storage, `users/${user.uid}/profile/${Date.now()}-${fileName}`);
        await uploadBytes(storageRef, photoFile, {
          contentType: photoFile.type,
        });
        uploadedPhotoURL = await getDownloadURL(storageRef);
      }

      await updateAuthProfile(auth.currentUser!, {
        displayName: fullName,
        photoURL: uploadedPhotoURL,
      });

      await setDoc(
        doc(firestore, "users", user.uid),
        {
          fullName,
          phone,
          city,
          state,
          bio,
          photoURL: uploadedPhotoURL,
          email: user.email ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await refreshProfile();
      setSuccessMessage("Perfil atualizado com sucesso.");
      setPhotoFile(null);
    } catch {
      setErrorMessage("Não foi possível salvar o perfil agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f6f7] text-[#071735]">
      <AppHeader />

      <section className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-[#dfe3e8] pb-6">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#687280]">Minha conta</p>
          <h1 className="mt-3 text-[30px] font-semibold leading-[36px] text-[#071735]">
            Perfil
          </h1>
          <p className="mt-2 max-w-[720px] text-[15px] leading-[24px] text-[#52606d]">
            Atualize sua foto, nome e dados de contato. A tela foi pensada para ser simples e direta,
            sem excesso de cartões ou elementos decorativos.
          </p>
        </div>

        <form className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]" onSubmit={handleSubmit}>
          <aside className="border border-[#dfe3e8] bg-white p-6">
            <div className="flex items-center gap-4 border-b border-[#edf0f2] pb-6">
              <div className="relative h-24 w-24 overflow-hidden border border-[#dfe3e8] bg-[#ecf8e8]">
                {photoURL ? (
                  <img className="h-full w-full object-cover" alt="Foto de perfil" src={photoURL} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[24px] font-semibold text-[#167307]">
                    {initials || "U"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[12px] uppercase tracking-[0.16em] text-[#687280]">Foto</p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#167307]">
                  <FiCamera />
                  Trocar foto
                  <input className="hidden" accept="image/*" onChange={handlePhotoChange} type="file" />
                </label>
                <p className="mt-2 text-[12px] leading-[18px] text-[#687280]">
                  PNG ou JPG. A imagem fica armazenada no seu espaço privado.
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-[14px] leading-[20px]">
              <div>
                <dt className="text-[#687280]">E-mail</dt>
                <dd className="font-medium text-[#071735]">{user.email}</dd>
              </div>
              <div>
                <dt className="text-[#687280]">Tipo de conta</dt>
                <dd className="font-medium text-[#071735]">{profile?.accountType ?? "Usuário"}</dd>
              </div>
              <div>
                <dt className="text-[#687280]">Deficiência</dt>
                <dd className="font-medium text-[#071735]">{profile?.disabilityType ?? "Não informado"}</dd>
              </div>
            </dl>
          </aside>

          <section className="border border-[#dfe3e8] bg-white p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label>
                <span className={labelClassName}>Nome completo</span>
                <input
                  className={fieldClassName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Seu nome"
                  value={fullName}
                />
              </label>

              <label>
                <span className={labelClassName}>Telefone</span>
                <input
                  className={fieldClassName}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(81) 99999-9999"
                  value={phone}
                />
              </label>

              <label>
                <span className={labelClassName}>Cidade</span>
                <input
                  className={fieldClassName}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Recife"
                  value={city}
                />
              </label>

              <label>
                <span className={labelClassName}>Estado</span>
                <input
                  className={fieldClassName}
                  onChange={(event) => setState(event.target.value)}
                  placeholder="PE"
                  value={state}
                />
              </label>
            </div>

            <label className="mt-6 block">
              <span className={labelClassName}>Sobre você</span>
              <textarea
                className={`${fieldClassName} min-h-[120px] resize-y border-b border-[#d6d9dc] py-3`}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Conte um pouco sobre você"
                value={bio}
              />
            </label>

            {errorMessage ? <p className="mt-4 text-[13px] text-[#b42318]">{errorMessage}</p> : null}
            {successMessage ? (
              <p className="mt-4 text-[13px] text-[#167307]">{successMessage}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-12 items-center gap-2 border-0 bg-[#167307] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={saving}
                type="submit"
              >
                <FiSave />
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>

              <button
                className="h-12 border border-[#dfe3e8] bg-white px-5 text-[14px] font-medium text-[#071735] transition-colors hover:border-[#167307] hover:text-[#167307]"
                onClick={() => navigate("/")}
                type="button"
              >
                Voltar para a loja
              </button>
            </div>
          </section>
        </form>
      </section>

      {cropOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-[2px]">
          <div className="w-full max-w-[920px] max-h-[calc(100vh-3rem)] overflow-hidden border border-white/10 bg-white text-[#071735] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-[#e4e7eb] px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#667085]">Foto de perfil</p>
                <h2 className="mt-1 text-[22px] font-semibold leading-[28px] text-[#071735]">
                  Posicione e recorte sua imagem
                </h2>
              </div>

              <button
                aria-label="Fechar recorte"
                className="flex h-10 w-10 items-center justify-center border border-[#e4e7eb] bg-white text-[#667085] transition-colors hover:border-[#d0d5dd] hover:text-[#071735]"
                onClick={closeCropModal}
                type="button"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="grid max-h-[calc(100vh-8.5rem)] gap-0 overflow-y-auto lg:grid-cols-[1fr_300px] lg:overflow-hidden">
              <div className="border-b border-[#e4e7eb] bg-[#0b0f12] p-4 lg:border-b-0 lg:border-r lg:border-[#e4e7eb]">
                <div
                  ref={cropFrameRef}
                  className={`relative aspect-square w-full max-h-[min(70vh,560px)] overflow-hidden bg-[#0f1215] ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  onPointerDown={handleCropPointerDown}
                >
                  {cropSourceUrl ? (
                    <img
                      alt="Recorte da foto"
                      className="absolute select-none"
                      draggable={false}
                      onDragStart={(event) => event.preventDefault()}
                      onLoad={(event) => {
                        const target = event.currentTarget;
                        setCropDimensions({
                          width: target.naturalWidth,
                          height: target.naturalHeight,
                        });
                      }}
                      src={cropSourceUrl}
                      style={
                        cropDimensions
                          ? (() => {
                              const baseScale = Math.max(
                                cropFrameSize / cropDimensions.width,
                                cropFrameSize / cropDimensions.height
                              );

                              return {
                                width: `${cropDimensions.width * baseScale * cropZoom}px`,
                                height: `${cropDimensions.height * baseScale * cropZoom}px`,
                                left: `${50 + cropOffset.x}%`,
                                top: `${50 + cropOffset.y}%`,
                                transform: "translate(-50%, -50%)",
                              };
                            })()
                          : {
                              left: "50%",
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "100%",
                              height: "100%",
                            }
                      }
                    />
                  ) : null}

                  <div className="pointer-events-none absolute inset-0 border border-white/10" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_36%,rgba(0,0,0,0.22)_100%)]" />
                </div>
              </div>

              <aside className="bg-white p-5">
                <div className="rounded-none border border-[#e4e7eb] bg-[#f8fafc] p-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-[#667085]">Ajustes</p>

                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-[13px] font-medium text-[#344054]">Zoom</span>
                      <div className="flex items-center gap-3">
                        <FiZoomOut className="shrink-0 text-[#98a2b3]" />
                        <input
                          className="h-2 w-full accent-[#167307]"
                          max="3"
                          min="1"
                          onChange={(event) => setCropZoom(Number(event.target.value))}
                          step="0.01"
                          type="range"
                          value={cropZoom}
                        />
                        <FiZoomIn className="shrink-0 text-[#98a2b3]" />
                      </div>
                    </label>

                    <p className="text-[12px] leading-[18px] text-[#667085]">
                      Arraste a imagem para posicionar o rosto dentro da área de corte. Quanto mais zoom,
                      mais perto a foto fica.
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[#e4e7eb] pt-4">
                    <div className="relative mx-auto flex h-[180px] w-[180px] items-center justify-center overflow-hidden border border-[#d0d5dd] bg-[#ecf8e8]">
                      {cropSourceUrl && cropDimensions ? (
                        <img
                          alt="Prévia do recorte"
                          className="absolute select-none"
                          draggable={false}
                          src={cropSourceUrl}
                          style={{
                            width: `${cropDimensions.width * Math.max(cropFrameSize / cropDimensions.width, cropFrameSize / cropDimensions.height) * cropZoom * (180 / cropFrameSize)}px`,
                            height: `${cropDimensions.height * Math.max(cropFrameSize / cropDimensions.width, cropFrameSize / cropDimensions.height) * cropZoom * (180 / cropFrameSize)}px`,
                            left: `calc(50% + ${cropOffset.x}%)`,
                            top: `calc(50% + ${cropOffset.y}%)`,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="inline-flex h-11 items-center gap-2 border border-[#d0d5dd] bg-white px-4 text-[14px] font-medium text-[#344054] transition-colors hover:border-[#98a2b3]"
                    onClick={closeCropModal}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="inline-flex h-11 items-center gap-2 border-0 bg-[#167307] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#125d05] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isCropping || !cropSourceUrl || !cropDimensions}
                    onClick={() => {
                      void applyCrop();
                    }}
                    type="button"
                  >
                    <FiCheck />
                    {isCropping ? "Aplicando..." : "Usar foto recortada"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default TelaPerfil;