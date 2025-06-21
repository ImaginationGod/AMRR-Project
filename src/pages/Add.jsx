import "./Add.css"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// This is a simple display component to show the added item data
const ItemPreview = ({ data, onClose }) => {
    const navigate = useNavigate();

    if (!data) return null
    return (
        <div className="popup-box">
            <div className="popup-box-container">
                <h2 className="popup-box-container-heading">Item Added!</h2>
                <div className="popup-box-container-item">
                    <strong>Name:</strong> {data.text1}
                </div>
                <div className="popup-box-container-item">
                    <strong>Type:</strong> {data.text2}
                </div>
                <div className="popup-box-container-item">
                    <strong>Description:</strong> {data.text3}
                </div>
                {data.image && (
                    <div className="popup-box-container-item">
                        <strong>Cover Image:</strong><br />
                        <img src={data.image} alt="cover" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, marginTop: 4 }} />
                    </div>
                )}
                {data.images && data.images.length > 0 && (
                    <div className="popup-box-container-item">
                        <strong>Additional Images:</strong><br />
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                            {data.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`additional-${idx}`} style={{ maxWidth: 60, maxHeight: 60, borderRadius: 6 }} />
                            ))}
                        </div>
                    </div>
                )}
                <div className="popup-box-button-container">
                    <button className="popup-box-button-container-button" onClick={onClose}>Close</button>
                    <button
                        className="popup-box-button-container-button"
                        onClick={() => navigate("/view")}
                    >
                        Go to View
                    </button>
                </div>
            </div>
        </div>
    )
}

const Add = () => {
    const [formData, setFormData] = useState({
        text1: "",
        text2: "",
        text3: "",
        image: null,      // Will store DataURL string for cover image
        images: []        // Will store array of DataURL strings for additional images
    })
    const [showPopup, setShowPopup] = useState(false)
    const [submittedData, setSubmittedData] = useState(null)

    useEffect(() => {
        setShowPopup(false);
        setFormData({
            text1: "",
            text2: "",
            text3: "",
            image: null,
            images: []
        });
        setSubmittedData(null)
    }, [])

    // Helper to read a File as DataURL (returns a Promise)
    const fileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null)
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = (e) => reject(e)
            reader.readAsDataURL(file)
        })
    }

    const handleChange = async (e) => {
        const { name, value, type, files } = e.target
        if (type === "file") {
            if (name === "image") {
                // Only one file, convert to DataURL
                const file = files && files[0]
                if (file) {
                    const dataUrl = await fileToDataURL(file)
                    setFormData(prev => ({
                        ...prev,
                        image: dataUrl
                    }))
                } else {
                    setFormData(prev => ({
                        ...prev,
                        image: null
                    }))
                }
            } else if (name === "images") {
                // Multiple files, convert all to DataURL array
                const fileArr = files ? Array.from(files) : []
                if (fileArr.length > 0) {
                    Promise.all(fileArr.map(fileToDataURL)).then(dataUrls => {
                        setFormData(prev => ({
                            ...prev,
                            images: dataUrls
                        }))
                    })
                } else {
                    setFormData(prev => ({
                        ...prev,
                        images: []
                    }))
                }
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    // Pass data to ItemPreview
    const handleAdd = async (e) => {
        e.preventDefault()
        let newFormData = { ...formData }

        // Defensive: If user hasn't selected a new image, keep as null
        if (formData.image && typeof formData.image !== "string") {
            newFormData.image = await fileToDataURL(formData.image)
        }
        // Defensive: If images are not strings, convert
        if (formData.images && formData.images.length > 0 && typeof formData.images[0] !== "string") {
            newFormData.images = await Promise.all(formData.images.map(fileToDataURL))
        }

        // Set window.addedItemData as required
        window.addedItemData = {
            text1: newFormData.text1,
            text2: newFormData.text2,
            text3: newFormData.text3,
            image: newFormData.image,
            images: newFormData.images
        };

        setSubmittedData(newFormData)
        setShowPopup(true)
        setFormData({
            text1: "",
            text2: "",
            text3: "",
            image: null,
            images: []
        });
    }

    const handleClosePopup = () => {
        setShowPopup(false)
        setSubmittedData(null)
    }

    return (
        <div className="outer-container">
            {showPopup && (
                <ItemPreview data={submittedData} onClose={handleClosePopup} />
            )}
            <div className="container">
                <h1>Add Items</h1>
                <form className="form" onSubmit={handleAdd}>
                    <div className="form-group">
                        <label>
                            Item Name
                            <input
                                type="text"
                                name="text1"
                                autoComplete="off"
                                value={formData.text1}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Item Type
                            <input
                                type="text"
                                name="text2"
                                autoComplete="off"
                                value={formData.text2}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Item Description
                            <input
                                type="text"
                                name="text3"
                                autoComplete="off"
                                value={formData.text3}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Item Cover Image
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Item Additional Images
                            <input
                                type="file"
                                name="images"
                                accept="image/*"
                                multiple
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <div style={{display: "flex", width: "100%", gap: 10}}>
                        <button
                            type="button"
                            onClick={() => {
                                // Ensure navigate is defined
                                if (typeof navigate === "function") {
                                    navigate('/view');
                                } else {
                                    window.location.href = '/view';
                                }
                            }}
                        >
                            View Items
                        </button>
                        <button
                            type="submit"
                            disabled={
                                !formData.text1 ||
                                !formData.text2
                            }
                        >
                            Add
                        </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Add