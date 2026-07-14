// proctorApi.js
import api from "./api";

export const sendLog = async (
    applicationId,
    eventType,
    severity,
    description
) => {

    if (
        applicationId === null ||
        applicationId === undefined ||
        applicationId <= 0
    ) {
        console.log("❌ Invalid applicationId:", applicationId);
        return;
    }

    console.log("✅ Sending log for application:", applicationId);

    try {

        const res = await api.post("/proctor/log", {
            application_id: applicationId,
            event_type: eventType,
            severity,
            description
        });

        console.log(res.data);

    } catch (err) {

        console.error(err);

    }

};