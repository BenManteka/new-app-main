import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (authUser?.fullName) setFullName(authUser.fullName);
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSave = async () => {
    const updateData = {};
    if (fullName && fullName !== authUser?.fullName) updateData.fullName = fullName;
    if (Object.keys(updateData).length > 0) {
      await updateProfile(updateData);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4 shadow-sm">
            <div className="text-center mb-4">
              <h2 className="fw-bold">Profile</h2>
              <p className="text-muted">Your profile information</p>
            </div>

            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={selectedImg || authUser?.profilePic || "/avatar.jpg"}
                  alt="Profile"
                  className="rounded-circle border border-3"
                  style={{ width: 160, height: 160, objectFit: "cover" }}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`position-absolute bottom-0 end-0 bg-dark p-3 rounded-circle ${isUpdatingProfile ? "disabled" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-pencil-fill text-white"></i>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-muted small mt-2">
                {isUpdatingProfile ? "Uploading..." : "Click the pencil icon to update your photo"}
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-person me-2"></i> Full Name
              </label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isUpdatingProfile}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-envelope me-2"></i> Email Address
              </label>
              <input
                type="text"
                className="form-control"
                value={authUser?.email}
                readOnly
              />
            </div>

            <button
              className="btn btn-primary w-100 mt-3"
              disabled={isUpdatingProfile || fullName === authUser?.fullName}
              onClick={handleSave}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>

            <div className="card bg-light p-4 mt-4">
              <h5 className="fw-bold mb-3">Account Information</h5>
              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span>Account Status</span>
                <span className="text-success">Active</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
