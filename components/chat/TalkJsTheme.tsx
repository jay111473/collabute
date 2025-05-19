"use client";

import Talk from "talkjs";
import { useEffect } from "react";

const initializeTalkJsTheme = () => {
  Talk.ready.then(() => {
    const customTheme = {
      name: "collabute-theme",
      styles: {
        // Base colors
        primaryColor: "#6765F6",        // Primary color for buttons, links
        secondaryColor: "#99A1B3",      // Secondary color for UI elements
        accentColor: "#6765F6",         // Accent color for highlights
        backgroundColor: "#1A1A1A",     // Main background color
        
        // Text colors
        textColorPrimary: "#FFFFFF",    // Primary text color
        textColorSecondary: "#99A1B3",  // Secondary text color
        
        // Container styling
        container: {
          border: "none",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#1A1A1A",
        },
        
        // Message styling
        message: {
          bubble: {
            borderRadius: "0.5rem",
            padding: "8px 12px",
          },
          own: {
            bubble: {
              backgroundColor: "#334155", // Outgoing message bubbles
            },
          },
          other: {
            bubble: {
              backgroundColor: "#222222", // Incoming message bubbles
            },
          },
        },
        
        // Input area styling
        messageInput: {
          backgroundColor: "#1A1A1A",
          borderTop: "1px solid #334155",
          padding: "0.75rem",
        },
        
        // Button styling
        button: {
          primaryButton: {
            backgroundColor: "#6765F6",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            fontWeight: "medium",
            transition: "background-color 0.2s",
            ":hover": {
              backgroundColor: "#5651E5",
            },
          },
          secondaryButton: {
            backgroundColor: "transparent",
            border: "1px solid #334155",
            color: "#FFFFFF",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            ":hover": {
              backgroundColor: "rgba(103, 101, 246, 0.1)",
            },
          },
        },
        
        // Header styling
        chatHeader: {
          backgroundColor: "#1A1A1A",
          borderBottom: "1px solid #334155",
          padding: "0.75rem 1rem",
        },
      },
    };

    // Register the custom theme
    Talk.Theme.register(customTheme);
  });
};

const TalkJsTheme = () => {
  useEffect(() => {
    initializeTalkJsTheme();
  }, []);

  return null;
};

export default TalkJsTheme; 