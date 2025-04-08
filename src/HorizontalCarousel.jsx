import React, { useEffect, useState } from 'react';
import './HorizontalCarousel.css';

import { API_URL } from './config';

export default function HorizontalCarousel() {
    const [images, setImages] = useState([]);

    const fetchImages = async () => {
        const query = `
            query {
                recentFutureViewings(page: 1, pageSize: 20) {
                    id
                    name
                    createdAt
                    age
                    imageUrl
                    content
                    status
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
                console.error(data.errors);
                return;
            }

            const validImages = data.data.recentFutureViewings.filter(
                item => item.status === 'COMPLETED' && item.imageUrl
            );

            setImages(validImages);
        } catch (err) {
            console.error('Error fetching images:', err);
        }
    };

    useEffect(() => {
        fetchImages();
        const refreshInterval = setInterval(fetchImages, 2 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, []);

    if (images.length === 0) {
        return <p className="loading-message">Cargando imágenes...</p>;
    }

    // 🔁 Duplicamos el array para el loop visual
    const repeatedImages = [...images, ...images];

    return (
        <div className="carousel-horizontal-wrapper">
            <div className="carousel-track">
                {repeatedImages.map((img, index) => (
                    <div className="carousel-card" key={`${img.id}-${index}`}>
                        <img src={img.imageUrl} alt={img.content} />
                        <div className="image-label">
                            <h3>{img.name}</h3>
                            <p>{img.age} años</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
