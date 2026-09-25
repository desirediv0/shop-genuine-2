"use client";

import { useState } from "react";
import { IconStar, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function ReviewSection({ product }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleRatingClick = (rating) => {
    setReviewForm((prev) => ({ ...prev, rating }));
    if (formErrors.rating) {
      setFormErrors((prev) => ({ ...prev, rating: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (reviewForm.rating === 0) {
      errors.rating = "Please select a rating";
    }

    if (!reviewForm.comment.trim()) {
      errors.comment = "Please provide a review comment";
    }

    if (reviewForm.title.trim() && reviewForm.title.trim().length < 3) {
      errors.title = "Title should be at least 3 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${product.slug}&review=true`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchApi(`/users/reviews`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title.trim() || "Review",
          comment: reviewForm.comment.trim(),
        }),
      });

      if (response.success) {
        toast.success("Review submitted successfully!");
        setReviewForm({ rating: 0, title: "", comment: "" });
        setShowForm(false);
        window.location.reload();
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReview = () => {
    return isAuthenticated;
  };

  const ReviewFormComponent = () => (
    <form onSubmit={handleReviewSubmit} className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-[0.06em] mb-3" style={{ color: "#2A2A35" }}>Rating <span style={{ color: "#DC3545" }}>*</span></label>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button type="button" key={rating} onClick={() => handleRatingClick(rating)}>
              <IconStar
                className="h-8 w-8 cursor-pointer transition-colors"
                style={{ color: reviewForm.rating >= rating ? "#F97316" : formErrors.rating ? "#fca5a5" : "#d1d5db" }}
                fill={reviewForm.rating >= rating ? "#F97316" : "none"}
                stroke={1.5}
              />
            </button>
          ))}
        </div>
        {formErrors.rating && <p className="text-[12px] mt-2 text-center" style={{ color: "#DC3545" }}>{formErrors.rating}</p>}
      </div>

      <div>
        <label htmlFor="title" className="block text-[11px] font-medium uppercase tracking-[0.06em] mb-2" style={{ color: "#2A2A35" }}>Review Title</label>
        <input type="text" id="title" name="title" value={reviewForm.title} onChange={handleInputChange}
          className="w-full px-4 py-3 text-[13px] focus:outline-none transition-colors"
          style={{
            border: formErrors.title ? "1px solid #DC3545" : "1px solid #F1E1E9",
            borderRadius: "8px",
            color: "#2A2A35",
          }}
          placeholder="Give your review a title (optional)" />
        {formErrors.title && <p className="text-[12px] mt-1" style={{ color: "#DC3545" }}>{formErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-[11px] font-medium uppercase tracking-[0.06em] mb-2" style={{ color: "#2A2A35" }}>Review <span style={{ color: "#DC3545" }}>*</span></label>
        <textarea id="comment" name="comment" value={reviewForm.comment} onChange={handleInputChange} rows={4}
          className="w-full px-4 py-3 text-[13px] focus:outline-none transition-colors resize-none"
          style={{
            border: formErrors.comment ? "1px solid #DC3545" : "1px solid #F1E1E9",
            borderRadius: "8px",
            color: "#2A2A35",
          }}
          placeholder="Write your review here"></textarea>
        {formErrors.comment && <p className="text-[12px] mt-1" style={{ color: "#DC3545" }}>{formErrors.comment}</p>}
      </div>

      <div className="flex gap-3 justify-center pt-2">
        <button type="submit" disabled={isSubmitting}
          className="px-8 py-3 text-[11px] uppercase tracking-[0.05em] font-medium transition-colors duration-300 disabled:opacity-40"
          style={{ backgroundColor: "#2A2A35", color: "#fff", borderRadius: "8px" }}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </div>
          ) : "Submit Review"}
        </button>
        <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); setReviewForm({ rating: 0, title: "", comment: "" }); }}
          className="px-6 py-3 text-[11px] uppercase tracking-[0.05em] font-medium transition-colors duration-300"
          style={{ border: "1px solid #F1E1E9", color: "#726A78", borderRadius: "8px" }}>
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div>
      {product.reviews && product.reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg" style={{ color: "#2A2A35" }}>Customer Reviews</h3>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => <IconStar key={i} className="h-4 w-4" style={{ color: i < Math.round(product.avgRating || 0) ? "#F97316" : "#F1E1E9" }} fill={i < Math.round(product.avgRating || 0) ? "#F97316" : "none"} stroke={0} />)}
                </div>
                <span className="text-[12px]" style={{ color: "#726A78" }}>Based on {product.reviewCount} reviews</span>
              </div>
            </div>

            <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="pb-8" style={{ borderBottom: "1px solid #F1E1E9" }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[14px]" style={{ color: "#2A2A35" }}>{review.user.name}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => <IconStar key={i} className="h-3.5 w-3.5" style={{ color: i < review.rating ? "#F97316" : "#F1E1E9" }} fill={i < review.rating ? "#F97316" : "none"} stroke={0} />)}
                      </div>
                    </div>
                    <span className="text-[12px]" style={{ color: "#726A78" }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h4 className="font-medium text-[14px] mt-3" style={{ color: "#2A2A35" }}>{review.title}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed font-normal" style={{ color: "#726A78" }}>{review.comment}</p>

                  {review.adminReply && (
                    <div className="mt-4 p-4" style={{ backgroundColor: "#FFF5F9", border: "1px solid #F1E1E9", borderRadius: "8px" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.04em]" style={{ color: "#F97316" }}>Response from Shop Genuine:</p>
                      <p className="mt-2 text-[13px] leading-relaxed font-normal" style={{ color: "#726A78" }}>{review.adminReply}</p>
                      {review.adminReplyDate && <p className="mt-2 text-[11px]" style={{ color: "#9C94A3" }}>Replied on {new Date(review.adminReplyDate).toLocaleDateString()}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6" style={{ backgroundColor: "#FFF5F9", border: "1px solid #F1E1E9", borderRadius: "8px" }}>
            <h3 className="font-display text-lg mb-5" style={{ color: "#2A2A35" }}>Write a Review</h3>

            {!showForm ? (
              <button onClick={() => { if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}&review=true`); return; } setShowForm(true); }}
                className="px-8 py-3 text-[11px] uppercase tracking-[0.05em] font-medium transition-colors duration-300"
                style={{ backgroundColor: "#2A2A35", color: "#fff", borderRadius: "8px" }}>
                Write a Review
              </button>
            ) : <ReviewFormComponent />}

            {!canReview() && (
              <div className="mt-4 p-3 flex items-center text-[12px]" style={{ backgroundColor: "#FFF5F9", border: "1px solid rgba(249, 115, 22,0.3)", color: "#F97316", borderRadius: "8px" }}>
                <IconAlertCircle className="h-4 w-4 mr-2 flex-shrink-0" stroke={1.5} />
                You need to purchase this product to write a review
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12" style={{ backgroundColor: "#FFF5F9", border: "1px solid #F1E1E9", borderRadius: "8px" }}>
          <p className="text-[14px] mb-6 font-normal" style={{ color: "#726A78" }}>No reviews yet. Be the first to review this product!</p>
          <button onClick={() => { if (!isAuthenticated) { router.push(`/auth?redirect=/products/${product.slug}&review=true`); return; } setShowForm(true); }}
            className="px-8 py-3 text-[11px] uppercase tracking-[0.05em] font-medium transition-colors duration-300"
            style={{ backgroundColor: "#2A2A35", color: "#fff", borderRadius: "8px" }}>
            Write a Review
          </button>

          {showForm && (
            <div className="max-w-lg mx-auto mt-8 p-6 bg-white" style={{ border: "1px solid #F1E1E9", borderRadius: "8px" }}>
              <ReviewFormComponent />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
