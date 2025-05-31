"use client"

import type React from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Image from "next/image"
import AnimatedBackground from "@/components/AnimatedBackground"

interface Meal {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category?: string
  reviews: { _id: string; name: string; rating: number; comment: string }[]
}

interface Review {
  rating: number
  comment: string
}

interface User {
  id: string
  username: string
  email: string
}

const MealDetailsPage = () => {
  const params = useParams()
  const mealId = params?.mealId as string

  const { isAuthenticated, user } = useAuth() as { isAuthenticated: boolean; user: User | null }
  const [meal, setMeal] = useState<Meal | null>(null)
  const [review, setReview] = useState<Review>({ rating: 0, comment: "" })
  const [hoverRating, setHoverRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchMeal = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals/${mealId}`)
      const data: Meal = await res.json()
      setMeal(data)
    } catch (err) {
      console.error("Error fetching meal:", err)
    } finally {
      setLoading(false)
    }
  }, [mealId])

  useEffect(() => {
    fetchMeal()
  }, [fetchMeal])

  const handleReviewSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم.")
      return
    }

    if (!review.rating || !review.comment.trim()) {
      toast.error("يرجى تعبئة كل الحقول.")
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      if (!token || !user?.id) {
        toast.error("Authentication error. Please log in again.")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meals/${mealId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...review, userId: user.id }),
      })

      if (res.ok) {
        toast.success("تمت إضافة التقييم بنجاح!")
        setReview({ rating: 0, comment: "" })
        fetchMeal()
      } else {
        toast.error("فشل في إرسال التقييم.")
      }
    } catch (err) {
      console.error("Error adding review:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Image
            src="/logo.png"
            alt="شعار التطبيق"
            width={150}
            height={150}
            className="object-center block mx-auto mb-6"
          />
        </div>
      </div>
    )
  }

  if (!meal)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">لم يتم العثور على الوجبة.</h2>
        <p className="mt-2 text-gray-500">يرجى التحقق من الرابط والمحاولة مرة أخرى.</p>
      </div>
    )

  const avgRating = meal.reviews?.length
    ? (meal.reviews.reduce((sum, r) => sum + r.rating, 0) / meal.reviews.length).toFixed(1)
    : null

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl" dir="rtl">
      <AnimatedBackground />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Meal Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <div className="relative h-[300px] md:h-[300px] ">
                <Image
                  src={meal.image || "/placeholder.svg"}
                  alt={meal.name || "meal image"}
                  fill
                  className="object-scale-down"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                    {avgRating ? (
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-yellow-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{avgRating}</span>
                        <span className="text-gray-500 text-xs">({meal.reviews.length})</span>
                      </div>
                    ) : (
                      "لا يوجد تقييم"
                    )}
                  </div>
                  <span className="text-xl font-bold text-green-600 rtl">L.E {meal.price.toFixed(2)}</span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Meal Details and Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Meal Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h1 className="text-3xl font-bold text-gray-800">{meal.name}</h1>
            </div>
            <div className="p-6">
              <p className="text-lg text-gray-600 leading-relaxed">{meal.description}</p>
                {/* Displaying category */}
              <div className="rtl">
                  <span className="text-sm font-medium text-gray-500">التصنيف:</span>
                  <span className="ml-2 text-gray-700 font-semibold">{meal.category || "غير محدد"}</span>
                </div>
            </div>
                          

          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-row items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">التعليقات والتقييمات</h2>
              {avgRating && (
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={star <= Number.parseFloat(avgRating) ? "currentColor" : "none"}
                        stroke="currentColor"
                        className={`h-4 w-4 ${
                          star <= Number.parseFloat(avgRating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-sm text-gray-500">({meal.reviews.length})</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-6">
              {meal.reviews?.length ? (
                meal.reviews.map((rev, i) => (
                  <div key={rev._id || i} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">{rev.name}</h4>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= rev.rating ? "currentColor" : "none"}
                            stroke="currentColor"
                            className={`h-4 w-4 ${star <= rev.rating ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد تعليقات حتى الآن.</p>
                  <p className="text-gray-500 text-sm mt-1">كن أول من يضيف تقييماً لهذه الوجبة!</p>
                </div>
              )}

              <hr className="my-6 border-gray-200" />

              {/* Review Form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">أضف تقييمك</h3>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">التقييم:</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReview({ ...review, rating: star })}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= (hoverRating || review.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                            className={`h-6 w-6 ${
                              star <= (hoverRating || review.rating) ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">تعليقك:</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      required
                      placeholder="اكتب تعليقك هنا..."
                      className="w-full min-h-[120px] resize-none p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                      isAuthenticated && !submitting ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isAuthenticated || submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      "إرسال التقييم"
                    )}
                  </button>
                </form>
              ) : (
                
                <div>
                                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">أضف تقييمك</h3>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">التقييم:</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReview({ ...review, rating: star })}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= (hoverRating || review.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                            className={`h-6 w-6 ${
                              star <= (hoverRating || review.rating) ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">تعليقك:</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      required
                      placeholder="اكتب تعليقك هنا..."
                      className="w-full min-h-[120px] resize-none p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed ${
                      isAuthenticated && !submitting ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isAuthenticated || submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      "إرسال التقييم"
                    )}
                  </button>
                </form>

                  <p className="text-red-500 mt-3 text-sm text-center">يجب تسجيل الدخول لكتابة تقييم.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MealDetailsPage


