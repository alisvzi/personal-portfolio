"use client";
import { Content } from "@/types";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
} from "lucide-react";
import { useState } from "react";

import { AnimatedContainer, AnimatedItem } from "../ui/AnimatedContainer";

import { cn } from "../../lib/utils";

import { CONTACT_INFO } from "../../lib/constants";

interface ContactSectionProps {
  content: Content;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactSection({ content, className }: ContactSectionProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to send message");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      url: CONTACT_INFO.social.github,
      color: "hover:text-[#64ffda]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: CONTACT_INFO.social.linkedin,
      color: "hover:text-[#0077b5]",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: CONTACT_INFO.social.twitter,
      color: "hover:text-[#1da1f2]",
    },
  ];

  return (
    <section id="contact" className={"min-h-screen py-20  overflow-hidden"}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#64ffda]/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <AnimatedContainer
          variant="stagger"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-12"
        >
          {/* Section Title */}
          <AnimatedItem>
            <div className="text-center mb-16">
              <div className="flex flex-col items-center justify-center mb-8">
                <motion.span
                  className="text-[#64ffda] font-mono text-lg mb-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  04
                </motion.span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ccd6f6] flex items-center">
                  <motion.div
                    className="flex-1 h-px bg-gradient-to-l from-[#233554] to-transparent mr-8 w-32"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                  Get In Touch
                  <motion.div
                    className="flex-1 h-px bg-gradient-to-l from-[#233554] to-transparent ml-8 w-32"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: -1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                </h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto space-y-4"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#ccd6f6]">
                  Lets Work Together
                </h3>
                <p className="text-[#8892b0] text-lg leading-relaxed">
                  I&apos;m always interested in hearing about new opportunities,
                  whether that&apos;s a full-time position, contract work, or
                  just a chat about technology.
                </p>
              </motion.div>
            </div>
          </AnimatedItem>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Info */}
            <AnimatedItem variant="slideRight" className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-[#ccd6f6] mb-6">
                  Let&apos;s Connect
                </h4>

                {/* Contact Methods */}
                <div className="space-y-4">
                  <motion.a
                    href={`mailto:${content.contactEmail}`}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-[#233554] hover:border-[#64ffda]/50 transition-all duration-300 group"
                    whileHover={{
                      x: 10,
                      backgroundColor: "rgba(100, 255, 218, 0.05)",
                    }}
                  >
                    <div className="p-3 rounded-full bg-[#64ffda]/10 group-hover:bg-[#64ffda]/20 transition-colors">
                      <Mail className="w-5 h-5 text-[#64ffda]" />
                    </div>
                    <div>
                      <p className="text-[#ccd6f6] font-medium">Email</p>
                      <p className="text-[#8892b0] text-sm">
                        {content.contactEmail}
                      </p>
                    </div>
                  </motion.a>

                  <motion.a
                    href={`tel:${content.contactPhone}`}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-[#233554] hover:border-[#64ffda]/50 transition-all duration-300 group"
                    whileHover={{
                      x: 10,
                      backgroundColor: "rgba(100, 255, 218, 0.05)",
                    }}
                  >
                    <div className="p-3 rounded-full bg-[#64ffda]/10 group-hover:bg-[#64ffda]/20 transition-colors">
                      <Phone className="w-5 h-5 text-[#64ffda]" />
                    </div>
                    <div>
                      <p className="text-[#ccd6f6] font-medium">Phone</p>
                      <p className="text-[#8892b0] text-sm">
                        {content.contactPhone}
                      </p>
                    </div>
                  </motion.a>

                  <motion.div
                    className="flex items-center space-x-4 p-4 rounded-lg border border-[#233554]"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="p-3 rounded-full bg-[#64ffda]/10">
                      <MapPin className="w-5 h-5 text-[#64ffda]" />
                    </div>
                    <div>
                      <p className="text-[#ccd6f6] font-medium">Location</p>
                      <p className="text-[#8892b0] text-sm">
                        {CONTACT_INFO.location}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h5 className="text-lg font-medium text-[#ccd6f6]">
                  Follow Me
                </h5>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      className={cn(
                        "p-3 rounded-full bg-[#112240] border border-[#233554] text-[#8892b0] transition-all duration-300",
                        social.color
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      aria-label={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </AnimatedItem>

            {/* Contact Form */}
            <AnimatedItem variant="slideLeft" className="space-y-6">
              {!isSubmitted ? (
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#ccd6f6] text-sm font-medium mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 bg-[#112240] border rounded-lg text-[#ccd6f6] transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50 focus:border-[#64ffda]",
                          errors.name
                            ? "border-app-error"
                            : "border-[#233554] hover:border-[#64ffda]/30"
                        )}
                        placeholder="Your Name"
                      />
                      {errors.name && (
                        <p className="text-app-error-text text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#ccd6f6] text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-4 py-3 bg-[#112240] border rounded-lg text-[#ccd6f6] transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50 focus:border-[#64ffda]",
                          errors.email
                            ? "border-app-error"
                            : "border-[#233554] hover:border-[#64ffda]/30"
                        )}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-app-error-text text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#ccd6f6] text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3 bg-[#112240] border rounded-lg text-[#ccd6f6] transition-all duration-300",
                        "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50 focus:border-[#64ffda]",
                        errors.subject
                          ? "border-app-error"
                          : "border-[#233554] hover:border-[#64ffda]/30"
                      )}
                      placeholder="What's this about?"
                    />
                    {errors.subject && (
                      <p className="text-app-error-text text-xs mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#ccd6f6] text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3 bg-[#112240] border rounded-lg text-[#ccd6f6] transition-all duration-300 resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50 focus:border-[#64ffda]",
                        errors.message
                          ? "border-app-error"
                          : "border-[#233554] hover:border-[#64ffda]/30"
                      )}
                      placeholder="Tell me about your project or just say hello!"
                    />
                    {errors.message && (
                      <p className="text-app-error-text text-xs mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full flex items-center justify-center px-8 py-4 rounded-lg transition-all duration-300",
                      "bg-[#64ffda]/10 border border-[#64ffda] text-[#64ffda] font-mono",
                      "hover:bg-[#64ffda]/20 hover:shadow-lg hover:shadow-[#64ffda]/25",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-2 focus:ring-[#64ffda]/50"
                    )}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-[#64ffda] border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-6xl mb-4">✨</div>
                  <h4 className="text-2xl font-bold text-[#ccd6f6] mb-4">
                    Message Sent!
                  </h4>

                  <p className="text-[#8892b0] mb-6">
                    Thanks for reaching out! I&apos;ll get back to you as soon
                    as possible.
                  </p>

                  <motion.button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 border border-[#64ffda] text-[#64ffda] rounded-lg hover:bg-[#64ffda]/10 transition-all duration-300 font-mono text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send Another Message
                  </motion.button>
                </motion.div>
              )}
            </AnimatedItem>
          </div>

          {/* Call to Action */}
          <AnimatedItem variant="fadeSlideUp" className="text-center pt-16">
            <motion.div
              className="max-w-2xl mx-auto space-y-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-[#8892b0] text-lg">Looking for my resume?</p>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 border border-[#64ffda] text-[#64ffda] rounded-lg hover:bg-[#64ffda]/10 transition-all duration-300 font-mono mb-20"
              >
                Download Resume
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </a>
            </motion.div>
          </AnimatedItem>
        </AnimatedContainer>
      </div>
    </section>
  );
}

export default ContactSection;
