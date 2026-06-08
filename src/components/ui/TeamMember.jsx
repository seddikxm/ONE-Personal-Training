import { motion } from 'framer-motion';
import { cardItem, scaleOnHover } from '../../utils/animations';
import './TeamMember.css';

export default function TeamMember({ member }) {
  return (
    <motion.article
      className="team-member"
      variants={cardItem}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover="hover"
    >
      <motion.div className="team-member__image" variants={scaleOnHover}>
        <img src={member.image} alt={member.name} loading="lazy" />
      </motion.div>
      <div className="team-member__info">
        <h3>{member.name}</h3>
        <span className="team-member__role">{member.role}</span>
        {member.expertise && (
          <div className="team-member__expertise">
            {member.expertise.map((item, i) => (
              <span key={i} className="team-member__tag">{item}</span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
