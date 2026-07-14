//  BrowserMonitor.jsx
import { useEffect } from "react";
import { sendLog } from "../../api/proctorApi";

export default function BrowserMonitor({ applicationId }) {

    useEffect(() => {

        if (!applicationId) return;

        const handleRightClick = (e) => {
            e.preventDefault();

            sendLog(
                applicationId,
                "RIGHT_CLICK",
                "LOW",
                "Right click attempted."
            );
        };

        const beforeUnload = (e) => {

            sendLog(
                applicationId,
                "PAGE_EXIT",
                "HIGH",
                "Candidate tried leaving interview."
            );

            e.preventDefault();
            e.returnValue = "";

        };

        const handleKeyDown = (e) => {

            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && e.key === "I") ||
                (e.ctrlKey && e.key === "u") ||
                (e.ctrlKey && e.key === "c") ||
                (e.ctrlKey && e.key === "v")
            ) {

                sendLog(
                    applicationId,
                    "KEYBOARD_SHORTCUT",
                    "MEDIUM",
                    `Shortcut: ${e.key}`
                );

            }

        };

        const handleCopy = () => {

            sendLog(
                applicationId,
                "COPY_ATTEMPT",
                "LOW",
                "Candidate copied text."
            );
        };

        const handlePaste = () => {

            sendLog(
                applicationId,
                "PASTE_ATTEMPT",
                "LOW",
                "Candidate pasted text."
            );
        };

        const handleFullscreen = () => {

            if (!document.fullscreenElement) {

                sendLog(
                    applicationId,
                    "FULLSCREEN_EXIT",
                    "HIGH",
                    "Candidate exited fullscreen."
                );

            }

        };

        const handleVisibility = () => {
            console.log("Visibility Event:", applicationId);

            if (document.hidden) {
                sendLog(
                    applicationId,
                    "TAB_SWITCH",
                    "HIGH",
                    "Candidate switched browser tab."
                );
            }
        };

        const handleBlur = () => {
            console.log("Blur Event:", applicationId);

            sendLog(
                applicationId,
                "WINDOW_BLUR",
                "MEDIUM",
                "Candidate left browser window."
            );
        };

        const handleFocus = () => {
            console.log("Focus Event:", applicationId);
            sendLog(
                applicationId,
                "WINDOW_FOCUS",
                "LOW",
                "Candidate returned to browser."
            );
        };

      document.addEventListener(
            "visibilitychange",
            handleVisibility
        );

        window.addEventListener(
            "blur",
            handleBlur
        );

        window.addEventListener(
            "focus",
            handleFocus
        );

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        window.addEventListener(
            "beforeunload",
            beforeUnload
        );

        document.addEventListener(
            "contextmenu",
            handleRightClick
        );


        document.addEventListener(
            "copy",
            handleCopy
        );

        document.addEventListener(
            "paste",
            handlePaste
        );

        document.addEventListener(
            "fullscreenchange",
            handleFullscreen
        );

        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );

            window.removeEventListener(
                "blur",
                handleBlur
            );

            window.removeEventListener(
                "focus",
                handleFocus
            );

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            window.removeEventListener(
                "beforeunload",
                beforeUnload
            );

            document.removeEventListener(
                "contextmenu",
                handleRightClick
            );

            document.removeEventListener(
                "copy",
                handleCopy
            );

            document.removeEventListener(
                "paste",
                handlePaste
            );

            document.removeEventListener(
                "fullscreenchange",
                handleFullscreen
            );

        };

    }, [applicationId]);

    return null;
}