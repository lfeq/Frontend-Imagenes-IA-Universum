import React, { useEffect, useState, useCallback, useRef } from 'react';
import './HorizontalCarousel.css';
import { API_URL, IMAGES_URL } from './config';

const FETCH_INTERVAL_MS = 15 * 1000; // 15 segundos (para pruebas)
const SHIFT_INTERVAL_MS = 10 * 1000; // 10 segundos (para pruebas)
const GRID_SIZE = 9;
const FETCH_PAGE_SIZE = 20;
const SCREEN_STORAGE_KEY = "carousel_screen_id";

export default function ImageGrid() {
    const [displayedImages, setDisplayedImages] = useState(() => Array(GRID_SIZE).fill(null));
    const [incomingImageQueue, setIncomingImageQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [screenId, setScreenId] = useState(null);

    const queueRef = useRef(incomingImageQueue);
    useEffect(() => {
        queueRef.current = incomingImageQueue;
    }, [incomingImageQueue]);

    const displayRef = useRef(displayedImages);
    useEffect(() => {
        displayRef.current = displayedImages;
    }, [displayedImages]);

    // --- Registrar o recuperar screenId ---
    useEffect(() => {
        async function ensureScreenId() {
            let storedId = localStorage.getItem(SCREEN_STORAGE_KEY);
            if (storedId) {
                setScreenId(storedId);
                return;
            }
            // Registrar pantalla en el backend
            try {
                const mutation = `
                  mutation {
                    registerScreen(input: { name: "Pantalla Carousel" }) {
                      screen { id }
                    }
                  }
                `;
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: mutation }),
                });
                const data = await response.json();
                const id = data?.data?.registerScreen?.screen?.id;
                if (id) {
                    localStorage.setItem(SCREEN_STORAGE_KEY, id);
                    setScreenId(id);
                } else {
                    setError("No se pudo registrar la pantalla.");
                }
            } catch (err) {
                setError("Error registrando pantalla.");
            }
        }
        ensureScreenId();
    }, []);

    // --- fetchImages usa screenId ahora ---
    const fetchImages = useCallback(async () => {
        if (!screenId) return;
        console.log("FETCH: Buscando imágenes...");
        const query = `
            query {
                recentFutureViewings(screenId: "${screenId}", page: 1, pageSize: ${FETCH_PAGE_SIZE}) {
                    id name createdAt age imageUrl content status
                }
            }
        `;
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            if (data.errors) {
                console.error("FETCH Error (GraphQL):", data.errors);
                setError("Error al obtener datos de la API.");
                return;
            }
            const fetchedItems = data.data?.recentFutureViewings || [];
            const validImages = fetchedItems.filter(
                item => item.status === 'COMPLETED' && item.imageUrl
            );

            if (validImages.length > 0) {
                console.log(`FETCH OK: ${validImages.length} imágenes válidas recibidas.`);
                setIncomingImageQueue(prevQueue => {
                    const currentDisplayIds = new Set(displayRef.current.filter(img => img).map(img => img.id));
                    const currentQueueIds = new Set(prevQueue.map(img => img.id));
                    const imagesToAdd = validImages.filter(img =>
                        !currentDisplayIds.has(img.id) && !currentQueueIds.has(img.id)
                    );
                    if (imagesToAdd.length > 0) {
                        console.log(`FETCH QUEUE: Añadiendo ${imagesToAdd.length} imágenes realmente nuevas a la cola.`);
                        return [...prevQueue, ...imagesToAdd];
                    } else {
                        console.log(`FETCH QUEUE: No hay imágenes nuevas para añadir (ya mostradas o en cola).`);
                        return prevQueue;
                    }
                });
                setError(null);
            } else {
                console.log("FETCH: No se encontraron imágenes válidas en la respuesta.");
            }
        } catch (err) {
            console.error('FETCH Error (Network/JS):', err);
            setError("Error de conexión al obtener imágenes.");
        } finally {
            if (isLoading) {
                console.log("FETCH: Carga inicial completada.");
                setIsLoading(false);
            }
        }
    }, [isLoading, screenId]);

    const shiftImages = useCallback(() => {
        const currentQueue = queueRef.current;
        if (currentQueue.length === 0) return;
        const imageToShiftIn = currentQueue[0];
        setIncomingImageQueue(prevQueue => prevQueue.slice(1));
        setDisplayedImages(prevDisplay => [imageToShiftIn, ...prevDisplay.slice(0, GRID_SIZE - 1)]);
    }, []);

    // Intervalos solo cuando hay screenId
    useEffect(() => {
        if (!screenId) return;
        fetchImages();
        const fetchTimer = setInterval(fetchImages, FETCH_INTERVAL_MS);
        const shiftTimer = setInterval(shiftImages, SHIFT_INTERVAL_MS);
        return () => {
            clearInterval(fetchTimer);
            clearInterval(shiftTimer);
        };
    }, [fetchImages, shiftImages, screenId]);

    // Renderizado
    if (!screenId) {
        return <p className="loading-message">Registrando pantalla...</p>;
    }
    if (isLoading) {
        return <p className="loading-message">Cargando imágenes...</p>;
    }
    if (error && !displayedImages.some(Boolean)) {
        return <p className="loading-message">{error}</p>;
    }
    if (!error && !incomingImageQueue.length && !displayedImages.some(Boolean)) {
        return <p className="loading-message">Esperando nuevas imágenes...</p>;
    }
    return (
        <div className="grid-container">
            {displayedImages.map((img, index) => {
                const key = img ? `img-${img.id}` : `empty-${index}`;
                return (
                    <div className={`grid-item ${!img ? 'empty' : ''}`} key={key}>
                        {img ? (
                            <>
                                <div className="image-container">
                                    <img src={`${IMAGES_URL}${img.imageUrl}`} alt={img.content || `Imagen de ${img.name}`} />
                                </div>
                                <div className="image-label">
                                    <h3>{img.name}</h3>
                                    {img.age && <p>{img.age} años</p>}
                                </div>
                            </>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
