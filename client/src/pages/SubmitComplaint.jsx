import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUpload } from '../api/client.js';
import { COMPLAINT_CATEGORIES, MAX_IMAGE_SIZE, MAX_IMAGES } from '../constants/categories.js';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

function validateFiles(files) {
  if (files.length > MAX_IMAGES) {
    return `Maximum ${MAX_IMAGES} images allowed`;
  }

  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG and PNG images are allowed';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Each image must be 5MB or less';
    }
  }

  return null;
}

export default function SubmitComplaint() {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setSelectedFiles(selected) {
    const nextFiles = Array.from(selected);
    const validationError = validateFiles(nextFiles);
    if (validationError) {
      setError(validationError);
      return;
    }

    previews.forEach((url) => URL.revokeObjectURL(url));
    setError(null);
    setFiles(nextFiles);
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  }

  function handleFileChange(e) {
    setSelectedFiles(e.target.files);
  }

  function handleDrop(e) {
    e.preventDefault();
    setSelectedFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.category) {
      setError('Please select a category');
      return;
    }

    const fileError = validateFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('category', form.category);
      body.append('title', form.title);
      body.append('description', form.description);
      body.append('location', form.location);
      files.forEach((file) => body.append('images', file));

      const data = await apiUpload('/api/complaints', body);
      setSubmitted(data.complaint);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setFiles([]);
      setPreviews([]);
      setForm({ category: '', title: '', description: '', location: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-green-900">Complaint Submitted</h1>
        <p className="mt-2 text-sm text-green-800">
          Your complaint has been received and is awaiting verification.
        </p>
        <dl className="mt-6 rounded-md bg-white p-4 text-left text-sm">
          <div className="grid grid-cols-2 gap-2">
            <dt className="text-gray-500">Complaint ID</dt>
            <dd className="font-semibold text-gray-900">{submitted.complaintId}</dd>
            <dt className="text-gray-500">Status</dt>
            <dd>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {submitted.status}
              </span>
            </dd>
            <dt className="text-gray-500">Submitted</dt>
            <dd className="text-gray-900">{new Date(submitted.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setSubmitted(null)}
            className="rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Submit another
          </button>
          <Link
            to="/"
            className="rounded-md border border-blue-800 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Submit Complaint</h1>
      <p className="mt-1 text-sm text-gray-600">
        Describe the community problem, add photos, and submit for verification.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            required
            value={form.category}
            onChange={update('category')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {COMPLAINT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={update('title')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={form.description}
            onChange={update('description')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location / Address
          </label>
          <input
            id="location"
            type="text"
            required
            value={form.location}
            onChange={update('location')}
            placeholder="Street, area, or landmark"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Images (optional, up to {MAX_IMAGES})
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 text-center hover:border-blue-400"
          >
            <p className="text-sm text-gray-600">Drag and drop JPG/PNG files here, or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm font-medium text-blue-800 hover:underline"
            >
              choose files
            </button>
            <p className="mt-1 text-xs text-gray-500">Max 5MB per file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {previews.map((src, index) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white hover:bg-black/80"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit complaint'}
        </button>
      </form>
    </div>
  );
}
