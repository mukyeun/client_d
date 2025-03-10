import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api';
import { LoadingSpinner } from '../LoadingSpinner';

const UserList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await patientApi.getAll();
                setPatients(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {patients.map(patient => (
                <div key={patient._id}>
                    <h3>{patient.name}</h3>
                    <p>연락처: {patient.contact.phone}</p>
                </div>
            ))}
        </div>
    );
};

export default UserList; 