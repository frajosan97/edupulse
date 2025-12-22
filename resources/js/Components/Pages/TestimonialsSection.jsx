import React, { useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            when: "beforeChildren",
        },
    },
};

const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8 },
    },
};

const starVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (i) => ({
        scale: 1,
        opacity: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.3,
        },
    }),
};

/* --------------------------------------------------
   Testimonial Generator
-------------------------------------------------- */

const generateTestimonials = (count = 10) => {
    const names = [
        "James Mwangi",
        "Wanjiku Njoroge",
        "Peter Kamau",
        "Aisha Hassan",
        "Daniel Otieno",
        "Grace Wambui",
        "Brian Kiplagat",
        "Sarah Mutiso",
        "Kevin Ouma",
        "Mary Atieno",
    ];

    const roles = [
        "Verified User",
        "Long-term Client",
        "Community Member",
        "Platform User",
        "Early Adopter",
        "Returning Customer",
    ];

    const comments = [
        "The experience has been smooth and reliable from the start. Everything works exactly as expected.",
        "I appreciate the attention to detail and the overall ease of use. It saves me a lot of time.",
        "Consistent performance and clear communication make this a dependable choice.",
        "The quality and reliability have exceeded my expectations so far.",
        "Everything feels well thought out and easy to navigate.",
        "Support has been responsive and helpful whenever needed.",
        "It integrates seamlessly into my daily workflow.",
        "I’ve had a very positive experience using this over time.",
    ];

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: names[i % names.length],
        role: roles[Math.floor(Math.random() * roles.length)],
        content: comments[Math.floor(Math.random() * comments.length)],
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        avatar: "/storage/images/landlord/profiles/avatar.png",
    }));
};

export default function TestimonialsSection() {
    const testimonials = useMemo(() => generateTestimonials(3), []);

    return (
        <Container fluid className="testimonials-section py-5">
            <Container>
                <motion.div
                    className="text-center mb-5"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <span className="section-subtitle">WHAT PEOPLE SAY</span>
                    <h2 className="section-title">Success Stories</h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    <Row className="g-4">
                        {testimonials.map((testimonial) => (
                            <Col key={testimonial.id} lg={4} md={6}>
                                <motion.div
                                    className="testimonial-card main-background-2"
                                    variants={cardVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <FaQuoteLeft className="quote-icon" />

                                    <div className="testimonial-content">
                                        <p>{testimonial.content}</p>
                                    </div>

                                    <div className="testimonial-rating mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.span
                                                key={i}
                                                custom={i}
                                                initial="hidden"
                                                animate="visible"
                                                variants={starVariants}
                                            >
                                                <FaStar
                                                    className={
                                                        i < testimonial.rating
                                                            ? "star-filled"
                                                            : "star-empty"
                                                    }
                                                />
                                            </motion.span>
                                        ))}
                                    </div>

                                    <motion.div
                                        className="testimonial-author"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <motion.img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="author-avatar"
                                            whileHover={{ scale: 1.05 }}
                                        />
                                        <div className="author-info">
                                            <h5>{testimonial.name}</h5>
                                            <span>{testimonial.role}</span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </motion.div>
            </Container>
        </Container>
    );
}
