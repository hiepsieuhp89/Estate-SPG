import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  fetchListings,
  createListing,
  updateListingWithImageManagement,
  deleteListingWithImages,
} from "@/utils/firebase";
import { Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { isLoggedIn, getCurrentUser } from "@/utils/auth";

export const RealEstatePage = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchListingsData();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchTerm, listings]);

  const fetchListingsData = async () => {
    setIsLoading(true);
    const listingsData = await fetchListings();
    console.log("listingsData", listingsData);
    // Sort listings by date in descending order
    const sortedListings = listingsData.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    setListings(sortedListings);
    setFilteredListings(sortedListings);
    setIsLoading(false);
  };

  const filterListings = () => {
    if (!searchTerm.trim()) {
      setFilteredListings(listings);
      return;
    }

    const normalizeString = (str) => {
      return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const normalizedSearchTerm = normalizeString(searchTerm);

    const filtered = listings.filter((listing) => {
      const normalizedTitle = normalizeString(listing.title);
      const normalizedDescription = normalizeString(listing.description);
      const normalizedPrice = normalizeString(listing.price);

      return (
        normalizedTitle.includes(normalizedSearchTerm) ||
        normalizedDescription.includes(normalizedSearchTerm) ||
        normalizedPrice.includes(normalizedSearchTerm)
      );
    });

    setFilteredListings(filtered);
  };

  const openModal = (type, listing = null) => {
    if ((type === "create" || type === "edit" || type === "delete") && !isLoggedIn()) {
      alert("You must be logged in to perform this action.");
      return;
    }
    setSelectedListing(listing);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedListing(null);
    setIsModalOpen(false);
    setModalType("");
    setPreviewImages([]);
  };

  const handleCreate = async (newListing, imageFiles) => {
    if (!isLoggedIn()) {
      alert("You must be logged in to create a listing.");
      return;
    }
    try {
      setIsLoading(true);
      const currentUser = getCurrentUser();
      const listingWithCreator = {
        ...newListing,
        creator: currentUser.email,
      };
      const createdListing = await createListing(listingWithCreator, imageFiles);
      await fetchListingsData();
      closeModal();
    } catch (error) {
      console.error("Error adding document: ", error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    updatedListing,
    newImageFiles,
    removedImageUrls,
  ) => {
    const currentUser = getCurrentUser();
    if (!isLoggedIn() || currentUser.email !== updatedListing.creator) {
      alert("You don't have permission to update this listing.");
      return;
    }
    try {
      setIsLoading(true);
      const updatedListings = await updateListingWithImageManagement(
        updatedListing,
        newImageFiles,
        removedImageUrls,
      );
      await fetchListingsData();
      closeModal();
    } catch (error) {
      console.error("Error updating document: ", error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const listingToDelete = listings.find(listing => listing.id === id);
    const currentUser = getCurrentUser();
    if (!isLoggedIn() || currentUser.email !== listingToDelete.creator) {
      alert("You don't have permission to delete this listing.");
      return;
    }
    try {
      setIsLoading(true);
      await deleteListingWithImages(id);
      await fetchListingsData();
      closeModal();
    } catch (error) {
      console.error("Error removing document: ", error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return timestamp; // If it's already a string, return as is
  };

  const openImagePreview = (image, index) => {
    setPreviewImage(image);
    setPreviewImageIndex(index);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setPreviewImageIndex(0);
  };

  const navigateImage = (direction) => {
    if (!selectedListing) return;
    const newIndex = (previewImageIndex + direction + selectedListing.images.length) % selectedListing.images.length;
    setPreviewImage(selectedListing.images[newIndex]);
    setPreviewImageIndex(newIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-5xl font-bold text-white"
        >
          Real Estate Listings
        </motion.h1>
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 text-xl font-semibold text-gray-600 italic"
        >
          Maverick Can, a member of Thien Khoi group, offers a wealth of Real Estate sources. These curated listings in Ha Noi are personally sourced and grouped. Discover your ideal property and connect with Maverick Can for more information.
        </motion.h2>
        <div className="mb-6 flex items-center justify-between">
          {isLoggedIn() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal("create")}
              className="rounded-full bg-gradient-to-r from-brown-500 to-black-600 px-6 py-3 font-bold text-white shadow-lg transition duration-300 ease-in-out hover:from-brown-600 hover:to-black-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
              aria-label="Add new listing"
              disabled={isLoading}
            >
              <FaPlus className="mr-2 inline-block" /> Add New Listing
            </motion.button>
          )}
          <div className="relative">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-full bg-gray-700 px-4 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brown-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence>
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                className="overflow-hidden rounded-lg bg-gray-800 shadow-md transition duration-300 ease-in-out"
              >
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h2 className="mb-2 text-xl font-semibold text-white">
                    {listing.title}
                  </h2>
                  <p className="mb-2 text-lg font-bold text-brown-400">{listing.price}</p>
                  <p className="mb-4 text-sm text-gray-300">
                    {listing.description}
                  </p>
                  <div className="flex justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal("view", listing)}
                      className="rounded bg-gradient-to-r from-brown-500 to-black-600 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:from-brown-600 hover:to-black-700"
                      aria-label={`View details of ${listing.title}`}
                    >
                      View Details
                    </motion.button>
                    {isLoggedIn() && getCurrentUser().email === listing.creator && (
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openModal("edit", listing)}
                          className="mr-2 text-yellow-500 transition duration-300 ease-in-out hover:text-yellow-600"
                          aria-label={`Edit ${listing.title}`}
                          disabled={isLoading}
                        >
                          <FaEdit size={20} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openModal("delete", listing)}
                          className="text-red-500 transition duration-300 ease-in-out hover:text-red-600"
                          aria-label={`Delete ${listing.title}`}
                          disabled={isLoading}
                        >
                          <FaTrash size={20} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-gray-800 shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {modalType === "view" && "Property Details"}
                    {modalType === "create" && "Add New Listing"}
                    {modalType === "edit" && "Edit Listing"}
                    {modalType === "delete" && "Confirm Deletion"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 transition duration-300 ease-in-out hover:text-gray-200"
                    aria-label="Close modal"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {modalType === "view" && selectedListing && (
                  <div>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      className="mb-4 overflow-hidden rounded-lg"
                      style={{ aspectRatio: '16 / 9' }}
                    >
                      {selectedListing.images.map((image, index) => (
                        <SwiperSlide key={index} className="flex items-center justify-center bg-black">
                          <img
                            src={image}
                            alt={`${selectedListing.title} - Image ${index + 1}`}
                            className="max-h-full max-w-full object-contain cursor-pointer"
                            onClick={() => openImagePreview(image, index)}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {selectedListing.title}
                    </h3>
                    <p className="mb-2 text-brown-400">{selectedListing.price}</p>
                    <p className="mb-4 text-gray-300">
                      {selectedListing.description}
                    </p>
                    <p className="text-sm text-gray-400">
                      Listed on: {formatDate(selectedListing.date)}
                    </p>
                  </div>
                )}

                {(modalType === "create" || modalType === "edit") && isLoggedIn() && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const newImageFiles = Array.from(formData.getAll("images")).filter(file => file.size > 0);
                      const removedImageUrls = formData.getAll("removedImages");

                      const newListing = {
                        id: selectedListing ? selectedListing.id : null,
                        title: formData.get("title"),
                        price: formData.get("price"),
                        description: formData.get("description"),
                        creator: modalType === "edit" ? selectedListing.creator : getCurrentUser().email,
                        images: selectedListing
                          ? selectedListing.images.filter(
                              (url) => !removedImageUrls.includes(url),
                            )
                          : [],
                      };

                      if (modalType === "create") {
                        await handleCreate(newListing, newImageFiles);
                      } else {
                        await handleUpdate(
                          newListing,
                          newImageFiles,
                          removedImageUrls,
                        );
                      }
                      setPreviewImages([]); // Clear preview images after submission
                    }}
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="title"
                        className="mb-2 block text-sm font-bold text-gray-300"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-300 bg-gray-700 shadow focus:outline-none"
                        defaultValue={selectedListing?.title}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="price"
                        className="mb-2 block text-sm font-bold text-gray-300"
                      >
                        Price
                      </label>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        required
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-300 bg-gray-700 shadow focus:outline-none"
                        defaultValue={selectedListing?.price}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-bold text-gray-300"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        className="focus:shadow-outline h-32 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-300 bg-gray-700 shadow focus:outline-none"
                        defaultValue={selectedListing?.description}
                      ></textarea>
                    </div>
                    {modalType === "edit" && selectedListing && (
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-300">
                          Current Images
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedListing.images.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Listing image ${index + 1}`}
                                className="h-24 w-24 rounded object-cover"
                              />
                              <input
                                type="checkbox"
                                name="removedImages"
                                value={imageUrl}
                                className="absolute right-0 top-0 m-1"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Check images to remove them
                        </p>
                      </div>
                    )}
                    <div className="mb-4">
                      <label
                        htmlFor="images"
                        className="mb-2 block text-sm font-bold text-gray-300"
                      >
                        {modalType === "create" ? "Images" : "Add New Images"}
                      </label>
                      <input
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-300 bg-gray-700 shadow focus:outline-none"
                        onChange={handleImageChange}
                      />
                      {previewImages.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {previewImages.map((previewUrl, index) => (
                              <img
                                key={index}
                                src={previewUrl}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-24 rounded object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded bg-brown-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-brown-600"
                        disabled={isLoading}
                      >
                        {modalType === "create"
                          ? "Add Listing"
                          : "Update Listing"}
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "delete" && selectedListing && isLoggedIn() && (
                  <div>
                    <p className="mb-4 text-white">
                      Are you sure you want to delete "{selectedListing.title}"?
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(selectedListing.id)}
                        className="mr-2 rounded bg-red-500 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-red-600"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                      <button
                        onClick={closeModal}
                        className="rounded bg-gray-700 px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
            onClick={closeImagePreview}
          >
            <motion.img
              src={previewImage}
              alt="Full size preview"
              className="max-h-screen max-w-screen object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
            <button
              onClick={closeImagePreview}
              className="absolute right-4 top-4 text-white"
              aria-label="Close preview"
            >
              <FaTimes size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage(-1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              aria-label="Previous image"
            >
              <FaChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              aria-label="Next image"
            >
              <FaChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RealEstatePage;
