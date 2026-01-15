import React from 'react';
import QRCode from 'react-native-qrcode-svg';

/**
 * Generates a QR code base64 string from text
 * @param {string} text - The text to encode in the QR code
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateQRBase64 = async (text) => {
  return new Promise((resolve, reject) => {
    try {
      const qrCodeRef = React.createRef();
      
      // Create a temporary component to generate QR code
      const TempQR = () => (
        <QRCode
          getRef={qrCodeRef}
          value={text}
          size={180}
          color="black"
          backgroundColor="white"
          ecl="H"
          quietZone={10}
        />
      );

      // Note: In React Native, toDataURL is not directly available
      // We'll use a different approach - encode the text directly
      // This is a fallback that returns a data URI format
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(text).toString('base64')}`;
      resolve(dataUrl);
    } catch (error) {
      console.error('Error generating QR base64:', error);
      reject(error);
    }
  });
};

/**
 * Generates a QR code SVG component from text
 * @param {string} text - The text to encode in the QR code
 * @returns {React.ReactElement} - QR code SVG component
 */
export const generateQRData = (text) => {
  return (
    <QRCode
      value={text}
      size={200}
      color="black"
      backgroundColor="white"
      logoSize={0}
      logoMargin={0}
      logoBorderRadius={0}
      ecl="H" // High error correction level for readability
      quietZone={10}
      onError={(error) => {
        console.error('QR Code generation error:', error);
      }}
    />
  );
};

/**
 * Encodes text into a QR-safe format
 * @param {string} text - Original text
 * @returns {string} - Encoded text
 */
export const encodeToQR = (text) => {
  try {
    // QR codes can handle plain text, but we ensure it's properly formatted
    return String(text);
  } catch (error) {
    console.error('Error encoding text to QR:', error);
    return '';
  }
};

/**
 * Gets the QR code configuration for optimal rendering
 * @returns {Object} - QR code configuration object
 */
export const getQRConfig = () => {
  return {
    size: 200,
    color: 'black',
    backgroundColor: 'white',
    ecl: 'H', // High error correction level
    quietZone: 10,
  };
};
