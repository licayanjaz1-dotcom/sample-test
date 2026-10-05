'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Barangay, ComplaintCategory, ComplaintPriority } from '@/lib/types';
import {
  fetchBarangaysAction,
  fetchCategoriesAction,
} from '@/lib/actions/management';
import { submitComplaintAction } from '@/lib/actions/complaints';
import ComplaintLocationPicker from '../map/ComplaintLocationPicker';
import PhotoUpload from './PhotoUpload';
import {
  FileText,
  User,
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  Shield,
  Send,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ComplaintRegistrationForm() {
  const router = useRouter();

  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');

  // Complainant State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Location State
  const [barangayId, setBarangayId] = useState('');
  const [barangayName, setBarangayName] = useState('');
  const [purokZone, setPurokZone] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [barangayCoords, setBarangayCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Evidence
  const [photoPath, setPhotoPath] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successComplaintNumber, setSuccessComplaintNumber] = useState<string | null>(
    null
  );
  const [newComplaintId, setNewComplaintId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [catsRes, brgysRes] = await Promise.all([
          fetchCategoriesAction(),
          fetchBarangaysAction(),
        ]);
        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data);
          if (catsRes.data.length > 0) setCategoryId(catsRes.data[0].id);
        }
        if (brgysRes.success && brgysRes.data) {
          setBarangays(brgysRes.data);
        }
      } catch {
        // Ignored
      } finally {
        setLoadingData(false);
      }
    }
    init();
  }, []);

  const handleBarangaySelect = (selectedId: string) => {
    setBarangayId(selectedId);
    const brgy = barangays.find((b) => b.id === selectedId);
    if (brgy) {
      setBarangayName(brgy.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!barangayId) {
      setErrorMessage('Please select a Barangay for the complaint location.');
      return;
    }

    if (!isAnonymous && (!fullName || fullName.trim().length < 2)) {
      setErrorMessage('Please enter the complainant full name or check Anonymous.');
      return;
    }

    if (!description || description.trim().length < 10) {
      setErrorMessage(
        'Please enter a detailed description of the problem (at least 10 characters).'
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        categoryId,
        description,
        priority,
        isAnonymous,
        fullName: isAnonymous ? '' : fullName,
        contactNumber,
        email: email || undefined,
        address,
        barangayId,
        barangayName,
        purokZone,
        street,
        landmark,
        locationDescription,
        latitude,
        longitude,
        photoPath,
      };

      const result = await submitComplaintAction(payload);

      if (result.success && result.data) {
        setSuccessComplaintNumber(result.data.complaint_number);
        setNewComplaintId(result.data.id);
      } else {
        setErrorMessage(result.error || 'Failed to submit complaint.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (successComplaintNumber && newComplaintId) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
            Submission Successful
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Complaint Registered Digitally
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Your complaint has been queued in the Butuan City Complaints Management
            System and assigned a tracking reference.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Complaint Tracking Number
          </div>
          <div className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 mt-1">
            {successComplaintNumber}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Initial Status:{' '}
            <span className="font-semibold text-amber-600">Pending Verification</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/complaints/${newComplaintId}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            View Complaint Details
          </Link>
          <Link
            href="/complaints"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            All Complaints List
          </Link>
          <button
            onClick={() => {
              setSuccessComplaintNumber(null);
              setNewComplaintId(null);
              setDescription('');
              setPhotoPath(null);
              setFullName('');
              setContactNumber('');
              setEmail('');
              setLandmark('');
              setPurokZone('');
              setStreet('');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Citizen Complaint & Incident Intake Form
            </h2>
            <p className="text-xs text-slate-500">
              Please provide complete details regarding the reported community concern in Butuan City.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: COMPLAINT INFORMATION */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Complaint Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Complaint Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority Level <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low - Minor inconvenience</option>
              <option value="Medium">Medium - Standard community concern</option>
              <option value="High">High - Significant hazard / traffic blockage</option>
              <option value="Urgent">Urgent - Immediate public safety / health risk</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Problem Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            placeholder="Clearly describe the incident, damage, obstruction, or concern. Include what happened, duration, and effects on the community..."
            className="w-full text-xs p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <span className="text-[11px] text-slate-400">
            Minimum 10 characters. Character count: {description.length}
          </span>
        </div>
      </div>

      {/* SECTION 2: COMPLAINANT INFORMATION */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Complainant Information
            </h3>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Submit Anonymously
            </span>
          </label>
        </div>

        {isAnonymous ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <strong className="block font-semibold">Anonymous Mode Active</strong>
              Your name and personal identification will NOT be recorded with this
              complaint. The complaint will still be verified and addressed by Butuan City
              responders.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isAnonymous}
                placeholder="e.g. Maria Santos"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. 0917-123-4567"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. citizen@example.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Complainant Home Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Purok 3, Libertad, Butuan City"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: LOCATION IDENTIFICATION & MAP */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Complaint Location Identification
          </h3>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 text-xs text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Barangay is required.</strong> Exact Purok, Street, and GPS Pin are
            optional. You can provide a landmark or click anywhere on the OpenStreetMap
            below to pinpoint the incident.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Barangay <span className="text-red-500">*</span>
            </label>
            <select
              value={barangayId}
              onChange={(e) => handleBarangaySelect(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">-- Select Butuan City Barangay (86 Total) --</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Purok / Zone <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={purokZone}
              onChange={(e) => setPurokZone(e.target.value)}
              placeholder="e.g. Purok 4B"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Street / Road <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. J.C. Aquino Ave"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nearest Landmark <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Beside City Hall, Near CSU East Campus"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Location Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g. Corner lot beside the bakery, drainage culvert"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Interactive Map Picker */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Interactive OpenStreetMap Location Pin{' '}
            <span className="text-slate-400 font-normal">(Click or drag marker)</span>
          </label>
          <ComplaintLocationPicker
            initialLat={latitude}
            initialLng={longitude}
            barangayCoordinates={barangayCoords}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
        </div>
      </div>

      {/* SECTION 4: PHOTO EVIDENCE */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Camera className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Photo Evidence
          </h3>
        </div>

        <PhotoUpload
          initialUrl={photoPath}
          onPhotoSelected={(url) => setPhotoPath(url)}
        />
      </div>

      {/* SUBMISSION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="text-xs text-slate-500">
          By submitting this complaint, you affirm that the information provided is
          true and accurate for official verification.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/complaints"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-102"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Complaint...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
