"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Image from 'next/image';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserData {
  username: string;
  email: string;
  role: string;
}

export default function EditUserPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const userId = params?.userId;

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setUserData(data);
      } catch {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  if (!params) {
    return <div className="text-center py-10 text-red-500">Invalid parameters</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eee] relative">
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#eee] flex items-center justify-center px-4">
      <AnimatedBackground />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md transition-all z-10"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Edit User
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={userData.username || ""}
          onChange={handleChange}
          required
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email || ""}
          onChange={handleChange}
          required
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="role"
          value={userData.role || ""}
          onChange={handleChange}
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <button
          type="submit"
          className="w-full py-2 bg-[#222] hover:bg-[#333] text-white font-semibold rounded-lg transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (res.ok) {
        toast.success("User updated successfully!");
        router.push("/dashboard");
      } else {
        setError("Failed to update user");
      }
    } catch {
      setError("Error updating user");
    }
  }
}

