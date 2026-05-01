import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="badge"
                        >
                            🎉 Chào mừng đến với Bake n Take
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Thưởng thức hương vị <br /> 
                            <span className="gradient-text">Tuyệt vời nhất</span> từ lò bánh
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Chúng tôi mang đến những chiếc bánh tươi ngon mỗi ngày và trà sữa đậm đà 
                            chuẩn vị để làm bừng sáng ngày mới của bạn.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="hero-btns"
                        >
                            <Link to="/menu" className="btn-primary">
                                Khám phá Menu <ArrowRight size={20} />
                            </Link>
                            <Link to="/about" className="btn-secondary">
                                Về chúng tôi
                            </Link>
                        </motion.div>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <strong>5k+</strong>
                                <span>Khách hàng</span>
                            </div>
                            <div className="stat-item">
                                <strong>100+</strong>
                                <span>Món ăn</span>
                            </div>
                            <div className="stat-item">
                                <strong>4.9</strong>
                                <span>Đánh giá</span>
                            </div>
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="hero-image"
                    >
                        <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1000" alt="Delicious Cake" />
                        <div className="floating-card top-right">
                            <Star className="icon" />
                            <div>
                                <p>Bánh bán chạy</p>
                                <span>Tiramisu Special</span>
                            </div>
                        </div>
                        <div className="floating-card bottom-left">
                            <Clock className="icon" />
                            <div>
                                <p>Giao hàng nhanh</p>
                                <span>Chỉ trong 30 phút</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="feature-card"
                        >
                            <div className="feature-icon primary">
                                <ShieldCheck size={32} />
                            </div>
                            <h3>Chất lượng cao</h3>
                            <p>Nguyên liệu tươi sạch, 100% tự nhiên, đảm bảo an toàn vệ sinh thực phẩm cho gia đình bạn.</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="feature-card"
                        >
                            <div className="feature-icon secondary">
                                <Clock size={32} />
                            </div>
                            <h3>Giao hàng nhanh</h3>
                            <p>Đội ngũ shipper chuyên nghiệp, cam kết giao món ăn đến tận tay bạn chỉ trong vòng 30 phút.</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="feature-card"
                        >
                            <div className="feature-icon accent">
                                <Star size={32} />
                            </div>
                            <h3>Hương vị tuyệt hảo</h3>
                            <p>Công thức độc quyền từ những đầu bếp hàng đầu, mang đến trải nghiệm ẩm thực khó quên.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .home-page {
                    min-height: 100vh;
                }
                .hero {
                    padding: 6rem 0;
                    overflow: hidden;
                }
                .hero-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 4rem;
                    padding: 0 2rem;
                    align-items: center;
                }
                .badge {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: var(--primary-light);
                    color: var(--primary);
                    border-radius: 2rem;
                    font-weight: 700;
                    font-size: 0.85rem;
                    margin-bottom: 1.5rem;
                }
                h1 {
                    font-size: 4rem;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    color: var(--bg-dark);
                }
                p {
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                    max-width: 500px;
                }
                .hero-btns {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }
                .btn-primary {
                    background: var(--primary);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: var(--radius-lg);
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
                }
                .btn-secondary {
                    padding: 1rem 2rem;
                    border: 2px solid var(--border);
                    border-radius: var(--radius-lg);
                    font-weight: 700;
                    color: var(--text-main);
                }
                .hero-stats {
                    display: flex;
                    gap: 3rem;
                }
                .stat-item strong {
                    display: block;
                    font-size: 1.5rem;
                    color: var(--bg-dark);
                }
                .stat-item span {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .hero-image {
                    position: relative;
                }
                .hero-image img {
                    width: 100%;
                    border-radius: var(--radius-xl);
                    box-shadow: 20px 20px 60px rgba(0,0,0,0.1);
                }
                .floating-card {
                    position: absolute;
                    background: white;
                    padding: 1rem;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: var(--shadow-lg);
                }
                .top-right { top: 20px; right: -30px; }
                .bottom-left { bottom: 40px; left: -30px; }
                .floating-card .icon {
                    color: var(--accent);
                    background: #fffbeb;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                }
                .floating-card p {
                    margin: 0;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .floating-card span {
                    font-weight: 800;
                    font-size: 0.9rem;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }
                .features {
                    padding: 5rem 0;
                    background: white;
                }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2.5rem;
                }
                .feature-card {
                    padding: 3rem 2rem;
                    background: var(--bg-main);
                    border-radius: var(--radius-xl);
                    text-align: center;
                    transition: var(--transition);
                }
                .feature-card:hover {
                    background: white;
                    box-shadow: var(--shadow-lg);
                }
                .feature-icon {
                    width: 70px;
                    height: 70px;
                    border-radius: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                }
                .feature-icon.primary { background: #eef2ff; color: var(--primary); }
                .feature-icon.secondary { background: #fdf2f8; color: var(--secondary); }
                .feature-icon.accent { background: #fffbeb; color: var(--accent); }
                
                .feature-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: var(--bg-dark);
                }
                .feature-card p {
                    font-size: 1rem;
                    line-height: 1.6;
                    margin-bottom: 0;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

export default Home;
