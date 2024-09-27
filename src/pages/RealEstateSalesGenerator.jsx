import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaShareAlt, FaEdit, FaCheckCircle } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

// ... existing imports ...
import { processImages, generateSalesPost, mergeImages } from "@/utils/aiUtils";

export const RealEstateSalesGenerator = () => {
  const [images, setImages] = useState([]);
  const [generatedPost, setGeneratedPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mergedImage, setMergedImage] = useState(null);
  const [imageCaption, setImageCaption] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setImages(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const generatePost = async () => {
    setIsLoading(true);
    try {
      const extractedInfo = await processImages(images[0]);
      const generatedContent = await generateSalesPost(extractedInfo);
      setGeneratedPost(generatedContent);

      const mergedImageUrl = await mergeImages(images);
      setMergedImage(mergedImageUrl);

      const caption = `${extractedInfo.address}, ${extractedInfo.price}. Contact: ${extractedInfo.contact}`;
      setImageCaption(caption);
    } catch (error) {
      console.error("Error generating post:", error);
      // Handle error (e.g., show error message to user)
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleShare = () => {
    // Implement sharing functionality
    alert("Sharing functionality to be implemented");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Real Estate Sales Post Generator</h1>
      
      <div {...getRootProps()} className="border-dashed border-2 border-gray-300 rounded-lg p-8 mb-6 text-center cursor-pointer hover:border-blue-500 transition duration-300">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-lg text-blue-500">Drop the images here ...</p>
        ) : (
          <p className="text-lg">Drag 'n' drop some images here, or click to select files</p>
        )}
      </div>

      {images.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Images:</h2>
          <div className="flex flex-wrap gap-4">
            {images.map((file, index) => (
              <img
                key={index}
                src={file.preview}
                alt={`Uploaded property image ${index + 1}`}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={generatePost}
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 mb-6"
        disabled={images.length === 0 || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <CgSpinner className="animate-spin mr-2" />
            Generating Post...
          </span>
        ) : (
          "Generate Sales Post"
        )}
      </button>

      {generatedPost && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Generated Sales Post:</h2>
          {isEditing ? (
            <textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              className="w-full h-40 p-2 border rounded-md mb-4"
            />
          ) : (
            <p className="mb-4">{generatedPost}</p>
          )}
          <div className="flex justify-between items-center">
            <button
              onClick={isEditing ? handleSave : handleEdit}
              className="flex items-center bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-300"
            >
              {isEditing ? (
                <>
                  <FaCheckCircle className="mr-2" /> Save
                </>
              ) : (
                <>
                  <FaEdit className="mr-2" /> Edit
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
            >
              <FaShareAlt className="mr-2" /> Share
            </button>
          </div>
        </div>
      )}

      {mergedImage && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Merged Property Image:</h2>
          <div className="relative">
            <img
              src={mergedImage}
              alt="Merged property images"
              className="w-full rounded-lg shadow-md"
            />
            <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
              {imageCaption}
            </p>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>Accessibility: This component supports keyboard navigation and screen readers.</p>
        <p>For assistance, please contact our support team.</p>
      </div>
    </div>
  );
};

export default RealEstateSalesGenerator;
