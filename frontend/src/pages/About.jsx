import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    const branches = [
        {
            city: 'Hà Nội',
            address: 'Số 12, Phố Huế, Quận Hoàn Kiếm',
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
            desc: 'Không gian cổ điển giữa lòng thủ đô.'
        },
        {
            city: 'Đà Nẵng',
            address: '150 Bạch Đằng, Quận Hải Châu',
            image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=800',
            desc: 'Thưởng thức bánh ngon bên bờ sông Hàn.'
        },
        {
            city: 'TP. Hồ Chí Minh',
            address: '25 Lê Thánh Tôn, Quận 1',
            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
            desc: 'Năng động và hiện đại tại trung tâm thành phố.'
        }
    ];

    const stats = [
        { icon: <Award className="icon" />, label: 'Chứng nhận chất lượng', value: 'ISO 22000' },
        { icon: <Heart className="icon" />, label: 'Khách hàng hài lòng', value: '98%' },
        { icon: <Clock className="icon" />, label: 'Năm kinh nghiệm', value: '10+' },
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-content"
                    >
                        <h1>Bake <span className="gradient-text">n</span> Take</h1>
                        <p className="lead">Hành trình mang hương vị hạnh phúc đến mọi gia đình Việt.</p>
                    </motion.div>
                </div>
            </section>

            {/* Our Values */}
            <section className="values-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Giá trị cốt lõi</h2>
                        <p>Chúng tôi luôn đặt tâm huyết vào từng sản phẩm.</p>
                    </div>
                    <div className="values-grid">
                        <motion.div whileHover={{ y: -10 }} className="value-card">
                            <ShieldCheck size={40} className="v-icon" />
                            <h3>An toàn tuyệt đối</h3>
                            <p>Nguyên liệu sạch, quy trình chế biến khép kín đảm bảo vệ sinh.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -10 }} className="value-card">
                            <Clock size={40} className="v-icon" />
                            <h3>Luôn tươi mới</h3>
                            <p>Bánh được nướng mới mỗi ngày, không sử dụng chất bảo quản.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -10 }} className="value-card">
                            <Heart size={40} className="v-icon" />
                            <h3>Phục vụ tận tâm</h3>
                            <p>Mỗi khách hàng đều là người thân trong gia đình Bake n Take.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* National Network */}
            <section className="branches-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Hệ thống cửa hàng toàn quốc</h2>
                        <p>Hiện diện tại 3 miền để phục vụ bạn tốt hơn.</p>
                    </div>
                    <div className="branches-grid">
                        {branches.map((branch, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="branch-card"
                            >
                                <div className="branch-img">
                                    <img src={branch.image} alt={branch.city} />
                                    <div className="branch-overlay">
                                        <span>{branch.city}</span>
                                    </div>
                                </div>
                                <div className="branch-info">
                                    <h3>{branch.city}</h3>
                                    <p><MapPin size={16} /> {branch.address}</p>
                                    <span className="branch-desc">{branch.desc}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats & Hours */}
            <section className="stats-hours">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card">
                                {stat.icon}
                                <h4>{stat.value}</h4>
                                <p>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="hours-card glass-card"
                    >
                        <Clock size={32} />
                        <div>
                            <h3>Giờ hoạt động</h3>
                            <p>Thứ Hai - Thứ Sáu: 10:00 - 18:00</p>
                            <p>Thứ Bảy - Chủ Nhật: 09:00 - 20:00</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="about-cta">
                <div className="container">
                    <h2>Sẵn sàng thưởng thức bánh ngon?</h2>
                    <div className="cta-btns">
                        <Link to="/menu" className="btn-primary">
                            Khám phá Menu ngay <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .about-page { padding-bottom: 5rem; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
                
                .about-hero {
                    background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1517433447739-714212527b14?auto=format&fit=crop&q=80&w=2000');
                    background-size: cover;
                    background-position: center;
                    height: 50vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: white;
                    margin-bottom: 5rem;
                }
                .about-hero h1 { font-size: 5rem; margin-bottom: 1rem; }
                .lead { font-size: 1.5rem; font-weight: 500; opacity: 0.9; }

                .section-title { text-align: center; margin-bottom: 4rem; }
                .section-title h2 { font-size: 2.5rem; color: var(--bg-dark); margin-bottom: 1rem; }
                .section-title p { color: var(--text-muted); }

                .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 6rem; }
                .value-card { background: white; padding: 3rem 2rem; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow); }
                .v-icon { color: var(--primary); margin-bottom: 1.5rem; }
                .value-card h3 { margin-bottom: 1rem; }

                .branches-section { background: #f1f5f9; padding: 6rem 0; margin-bottom: 6rem; }
                .branches-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
                .branch-card { background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); }
                .branch-img { height: 250px; position: relative; overflow: hidden; }
                .branch-img img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
                .branch-card:hover img { transform: scale(1.1); }
                .branch-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: flex-end; padding: 1.5rem; color: white; font-weight: 700; font-size: 1.2rem; }
                .branch-info { padding: 1.5rem; }
                .branch-info h3 { margin-bottom: 0.5rem; color: var(--bg-dark); }
                .branch-info p { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem; }
                .branch-desc { font-style: italic; color: var(--primary); font-size: 0.85rem; }

                .stats-hours { padding: 4rem 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; margin-bottom: 4rem; }
                .stat-card { text-align: center; }
                .stat-card .icon { color: var(--secondary); margin-bottom: 1rem; width: 32px; height: 32px; }
                .stat-card h4 { font-size: 2rem; margin-bottom: 0.5rem; }
                .hours-card { display: flex; align-items: center; gap: 2rem; padding: 3rem; border-radius: var(--radius-xl); max-width: 700px; margin: 0 auto; background: white; }
                
                .about-cta { text-align: center; padding: 8rem 0; background: var(--bg-dark); color: white; border-radius: var(--radius-xl); margin: 4rem 2rem; }
                .about-cta h2 { font-size: 3rem; margin-bottom: 3rem; }
                .btn-primary { background: var(--primary); color: white; padding: 1.2rem 2.5rem; border-radius: var(--radius-lg); font-weight: 700; display: inline-flex; align-items: center; gap: 1rem; font-size: 1.1rem; }

                @media (max-width: 768px) {
                    .values-grid, .branches-grid, .stats-grid { grid-template-columns: 1fr; }
                    .about-hero h1 { font-size: 3rem; }
                    .hours-card { flex-direction: column; text-align: center; }
                }
            `}</style>
        </div>
    );
};

export default About;
