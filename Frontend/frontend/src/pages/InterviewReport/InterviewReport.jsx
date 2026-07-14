// InterviewReport.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../api/api";

export default function InterviewReport() {

    const { applicationId } = useParams();

    const [transcript, setTranscript] = useState("");

    useEffect(() => {
        loadTranscript();
    }, [applicationId]);

    const loadTranscript = async () => {

        try {

            const res = await api.get(
                `/interview-transcript/${applicationId}`
            );

            console.log(res.data);

            setTranscript(
                res.data.transcript || "Transcript not available."
            );

        } catch (err) {

            console.error(err);

            setTranscript("Transcript not found.");

        }

    };

    return (

        <Layout>

            <h1>AI Interview Transcript</h1>

            <div
                style={{
                    padding:20,
                    border:"1px solid #ccc",
                    borderRadius:10,
                    whiteSpace:"pre-wrap"
                }}
            >

                {transcript || "Transcript not available"}

            </div>

        </Layout>

    );

}