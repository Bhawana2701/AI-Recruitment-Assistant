// CameraMonitor.jsx
import { useEffect } from "react";
import { sendLog } from "../../api/proctorApi";

export default function CameraMonitor({ applicationId }) {

    useEffect(() => {

        if (!applicationId) return;

        navigator.mediaDevices.ondevicechange = async () => {

            const devices = await navigator.mediaDevices.enumerateDevices();

            const hasCamera = devices.some(
                d => d.kind === "videoinput"
            );

            if (!hasCamera) {

                sendLog(
                    applicationId,
                    "CAMERA_REMOVED",
                    "HIGH",
                    "Camera disconnected."
                );

            }

        };

    }, [applicationId]);

    return null;
}