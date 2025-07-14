"use client"
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Interface for the form data for type safety
interface UserSettingsData {
    username: string;
    slug: string;
    password?: string; // Password is optional
    email: string;
    phone: string;
    images: string;
    gallery: string[];
    facebook_link: string;
    bio: string;
    about: string;
}

const initialFormState: UserSettingsData = {
    username: "",
    slug: "",
    password: "",
    email: "",
    phone: "",
    images: "",
    gallery: [],
    facebook_link: "",
    bio: "",
    about: ""
};

export default function SettingsPage() {
    const [formData, setFormData] = useState<UserSettingsData>(initialFormState);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/me/settings');
                if (response.ok) {
                    const data = await response.json();
                    // Ensure all fields are present, providing defaults if not
                    setFormData({ ...initialFormState, ...data, password: '' }); 
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Type the event object for input and textarea changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Type the parameters for gallery changes
    const handleGalleryChange = (index: number, value: string) => {
        const newGallery = [...formData.gallery];
        newGallery[index] = value;
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    };

    // Type the index parameter for removing an item
    const removeGalleryItem = (index: number) => {
        const newGallery = formData.gallery.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    };

    const addGalleryItem = () => {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ''] }));
    };

    // Type the form submission event
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/me/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert("Settings updated successfully!");
                router.refresh();
            } else {
                const errorData = await response.json();
                alert(`Failed to update settings: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            alert("An error occurred while updating settings.");
        }
    };

    if (loading) {
        return <p>Loading settings...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4 p-4 border rounded-lg">
                <h2 className="text-xl font-bold">User Information</h2>
                <div>
                    <label className="block mb-1 font-medium">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Slug</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="block mb-1 font-medium">New Password (leave blank to keep current)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" autoComplete="new-password" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Profile Image URL</label>
                    <input type="url" name="images" value={formData.images} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                 <div>
                    <label className="block mb-1 font-medium">Gallery</label>
                    {formData.gallery.map((url, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleGalleryChange(index, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="https://example.com/image.jpg"
                            />
                            <button type="button" onClick={() => removeGalleryItem(index)} className="ml-2 text-red-500 hover:text-red-700">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addGalleryItem} className="text-blue-500 hover:text-blue-700">Add Gallery Image</button>
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
                <h2 className="text-xl font-bold">User Meta Information</h2>
                <div>
                    <label className="block mb-1 font-medium">Facebook Link</label>
                    <input type="url" name="facebook_link" value={formData.facebook_link} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-2 border rounded" rows={3}/>
                </div>
                 <div>
                    <label className="block mb-1 font-medium">About</label>
                    <textarea name="about" value={formData.about} onChange={handleChange} className="w-full p-2 border rounded" rows={5}/>
                </div>
            </div>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Settings</button>
        </form>
    );
}