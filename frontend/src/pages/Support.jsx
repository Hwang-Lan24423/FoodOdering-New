import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, 
    Truck, 
    CreditCard, 
    HelpCircle, 
    ChevronDown, 
    Mail, 
    Send, 
    Loader2, 
    CheckCircle2,
    PhoneCall,
    Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Support = () => {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        subject: '',
        message: ''
    });

    const faqs = [
        {
            q: "Làm thế nào để đặt hàng trực tuyến?",
            a: "Bạn chỉ cần chọn món ăn yêu thích vào giỏ hàng, sau đó vào phần Thanh toán, điền thông tin giao hàng và xác nhận. Chúng tôi sẽ gửi thông báo xác nhận đơn hàng ngay lập tức."
        },
        {
            q: "Phí vận chuyển được tính như thế nào?",
            a: "Chúng tôi áp dụng phí vận chuyển cố định là 15.000đ cho các đơn hàng trong nội thành và miễn phí vận chuyển cho đơn hàng trên 300.000đ."
        },
        {
            q: "Tôi có thể hủy đơn hàng sau khi đã đặt không?",
            a: "Bạn có thể hủy đơn hàng trong vòng 5 phút sau khi đặt nếu trạng thái đơn hàng vẫn là 'Chờ xử lý'. Vui lòng liên hệ hotline để được hỗ trợ nhanh nhất."
        },
        {
            q: "Bake n Take có những hình thức thanh toán nào?",
            a: "Hiện tại chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản ngân hàng qua mã QR (SePay) cực kỳ tiện lợi."
        },
        {
            q: "Làm sao để biết món ăn có đảm bảo vệ sinh không?",
            a: "Tất cả món ăn tại Bake n Take đều được chế biến từ nguyên liệu tươi mới mỗi ngày, tuân thủ nghiêm ngặt các quy chuẩn an toàn vệ sinh thực phẩm ISO 22000."
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tickets', formData);
            setSubmitted(true);
            setFormData({ fullname: '', email: '', subject: '', message: '' });
        } catch (err) {
            alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="support-page">
            {/* Hero Section */}
            <section className="support-hero">
                <div className="container">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-content"
                    >
                        <h1>Chúng tôi có thể <span className="gradient-text">Hỗ trợ</span> gì cho bạn?</h1>
                        <p>Dưới đây là các câu hỏi thường gặp và kênh liên hệ trực tiếp với đội ngũ Bake n Take.</p>
                    </motion.div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <div className="container">
                    <div className="actions-grid">
                        <motion.div whileHover={{ y: -10 }} className="action-card">
                            <div className="icon-box primary"><Truck size={32} /></div>
                            <h3>Theo dõi đơn hàng</h3>
                            <p>Kiểm tra trạng thái đơn hàng của bạn theo thời gian thực.</p>
                            <button className="text-btn" onClick={() => navigate('/orders')}>Kiểm tra ngay →</button>
                        </motion.div>
                        <motion.div whileHover={{ y: -10 }} className="action-card">
                            <div className="icon-box secondary"><MessageCircle size={32} /></div>
                            <h3>Chat với AI</h3>
                            <p>Trợ lý ảo Bake n Take luôn sẵn sàng giải đáp 24/7.</p>
                            <button className="text-btn" onClick={() => window.dispatchEvent(new CustomEvent('toggleChat', { detail: true }))}>Bắt đầu chat →</button>
                        </motion.div>
                        <motion.div whileHover={{ y: -10 }} className="action-card">
                            <div className="icon-box accent"><PhoneCall size={32} /></div>
                            <h3>Hotline hỗ trợ</h3>
                            <p>Liên hệ trực tiếp với chúng tôi qua số điện thoại 1900 xxxx.</p>
                            <a href="tel:19001234" className="text-btn">Gọi ngay →</a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ & Contact Form */}
            <section className="main-support">
                <div className="container">
                    <div className="support-grid">
                        {/* FAQ Side */}
                        <div className="faq-side">
                            <div className="section-header">
                                <HelpCircle className="section-icon" />
                                <h2>Câu hỏi thường gặp</h2>
                            </div>

                            <div className="faq-list">
                                {faqs.map((faq, index) => (
                                    <div 
                                        key={index} 
                                        className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                                    >
                                        <button 
                                            className="faq-question" 
                                            onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                        >
                                            <span>{faq.q}</span>
                                            <ChevronDown size={20} className="arrow" />
                                        </button>
                                        <AnimatePresence>
                                            {activeFaq === index && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="faq-answer"
                                                >
                                                    <p>{faq.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form Side */}
                        <div className="contact-side">
                            <div className="contact-card glass-card">
                                {submitted ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="success-state"
                                    >
                                        <CheckCircle2 size={64} color="#10b981" />
                                        <h3>Đã gửi yêu cầu!</h3>
                                        <p>Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi qua email trong vòng 24h.</p>
                                        <button className="btn-primary" onClick={() => setSubmitted(false)}>Gửi yêu cầu khác</button>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div className="section-header">
                                            <Mail className="section-icon" />
                                            <h2>Gửi yêu cầu hỗ trợ</h2>
                                        </div>
                                        <form onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label>Họ và tên</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={formData.fullname}
                                                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                                                    placeholder="Ví dụ: Nguyễn Văn A"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email liên hệ</label>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    placeholder="example@gmail.com"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Vấn đề cần hỗ trợ</label>
                                                <select 
                                                    required 
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                >
                                                    <option value="">Chọn một chủ đề</option>
                                                    <option value="Đơn hàng">Vấn đề về đơn hàng</option>
                                                    <option value="Thanh toán">Vấn đề về thanh toán</option>
                                                    <option value="Chất lượng">Phản hồi chất lượng món ăn</option>
                                                    <option value="Khác">Vấn đề khác</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Nội dung chi tiết</label>
                                                <textarea 
                                                    required 
                                                    rows="5"
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                                                ></textarea>
                                            </div>
                                            <button type="submit" className="btn-submit" disabled={loading}>
                                                {loading ? <Loader2 className="spin" /> : (
                                                    <>
                                                        <span>Gửi yêu cầu</span>
                                                        <Send size={18} />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .support-page { background: var(--bg-main); min-height: 100vh; padding-bottom: 5rem; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

                .support-hero { background: white; padding: 6rem 0; text-align: center; border-bottom: 1px solid var(--border); }
                .hero-content h1 { font-size: 3rem; margin-bottom: 1rem; color: var(--bg-dark); }
                .hero-content p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1rem; }
                
                .quick-actions { padding: 5rem 0; }
                .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
                .action-card { background: white; padding: 3rem 2rem; border-radius: var(--radius-xl); text-align: center; box-shadow: var(--shadow-sm); transition: var(--transition); }
                .icon-box { width: 70px; height: 70px; border-radius: 1.5rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; }
                .icon-box.primary { background: #eef2ff; color: var(--primary); }
                .icon-box.secondary { background: #fdf2f8; color: var(--secondary); }
                .icon-box.accent { background: #fffbeb; color: var(--accent); }
                .action-card h3 { font-size: 1.4rem; margin-bottom: 0.8rem; }
                .action-card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; }
                .text-btn { background: none; border: none; color: var(--primary); font-weight: 700; font-size: 1rem; }

                .main-support { padding: 4rem 0; }
                .support-grid { display: grid; grid-template-columns: 1fr 450px; gap: 4rem; }
                
                .section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem; }
                .section-icon { color: var(--primary); width: 28px; height: 28px; }
                .section-header h2 { font-size: 2rem; color: var(--bg-dark); }

                .faq-list { display: flex; flex-direction: column; gap: 1rem; }
                .faq-item { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; transition: var(--transition); }
                .faq-item.active { border-color: var(--primary); box-shadow: var(--shadow-md); }
                .faq-question { width: 100%; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: none; border: none; font-weight: 700; font-size: 1.1rem; text-align: left; color: var(--bg-dark); }
                .arrow { transition: transform 0.3s ease; color: var(--text-muted); }
                .faq-item.active .arrow { transform: rotate(180deg); color: var(--primary); }
                .faq-answer { padding: 0 1.5rem 1.5rem; color: var(--text-muted); line-height: 1.7; }

                .contact-card { padding: 3rem; border-radius: var(--radius-xl); position: sticky; top: 100px; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.6rem; color: var(--text-main); }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.8rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); font-family: inherit; transition: var(--transition); }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px var(--primary-light); }
                
                .btn-submit { width: 100%; background: var(--primary); color: white; padding: 1rem; border-radius: var(--radius-md); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.8rem; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); }
                .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(99, 102, 241, 0.4); }
                .btn-submit:disabled { opacity: 0.7; }

                .success-state { text-align: center; padding: 2rem 0; }
                .success-state h3 { font-size: 1.8rem; margin: 1.5rem 0 0.8rem; }
                .success-state p { color: var(--text-muted); margin-bottom: 2rem; }
                .btn-primary { background: var(--primary); color: white; padding: 0.8rem 2rem; border-radius: var(--radius-md); font-weight: 700; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 992px) {
                    .support-grid { grid-template-columns: 1fr; }
                    .contact-card { position: static; }
                    .actions-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Support;
