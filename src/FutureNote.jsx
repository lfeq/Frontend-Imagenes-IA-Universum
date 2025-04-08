import React, { useState } from 'react';
import './FutureNote.css';
import { API_URL } from './config';

//const API_URL = 'http://localhost:5000/graphql';

export default function FutureNote() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const mutation = `
            mutation AddFutureViewing($input: AddFutureViewingInput!) {
                addFutureViewing(input: $input) {
                    futureViewing {
                        id
                    }
                }
            }
        `;

        const variables = {
            input: {
                name: name,
                age: parseInt(age, 10),
                content: message,
            }
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: mutation,
                    variables: variables,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.errors) {
                throw new Error(data.errors?.[0]?.message || 'Error al guardar');
            }

            setSuccess(true);
            setName('');
            setAge('');
            setMessage('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="futuro-wrapper">
            <h1 className="titulo-principal">Nota para mi yo futuro</h1>
            <p className="instrucciones">
                Describe brevemente una idea de ¿cómo te imaginarías en un futuro?
            </p>

            <form className="nota-formulario" onSubmit={handleSubmit}>
                <div className="campo-nombre">
                    <label>Soy</label>
                    <input
                        type="text"
                        placeholder="Escribe tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <label>, y tengo</label>
                    <input
                        type="number"
                        placeholder="Edad"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                    <span>años.</span>
                </div>

                <textarea
                    placeholder="Escribe tu idea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />

                {success && (
                    <div className="mensaje-exito">
                        Se guardó exitosamente tu idea.
                        <br />
                        Al final del recorrido en Sala hay una pantalla donde podrás buscar la imagen generada.
                    </div>
                )}

                {error && <div className="mensaje-error">Error: {error}</div>}

                <button className="guardar-btn" type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar idea'}
                </button>
            </form>

            <p className="nota-info">
                Con tu idea se generará una imagen por Inteligencia Artificial.
                Al final de tu visita en la Sala podrás buscarla en el monitor “TU FUTURO EN IMAGEN”.
                Si es seleccionada se expondrá junto a otras en la siguiente página: <br />
                <a href="http://Universum.org/imagenesFuturo" target="_blank" rel="noopener noreferrer">
                    http://Universum.org/imagenesFuturo
                </a>
            </p>
        </div>
    );
}
