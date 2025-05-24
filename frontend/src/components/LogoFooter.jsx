import { FaInstagram, FaTwitter,  FaFacebook } from 'react-icons/fa';
import styled from 'styled-components';
   
   const LogoFooter = () => {
     return (
       <StyledWrapper>
         <div className="card">
           <a href="https://instagram.com" className="social-link1" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
             <FaInstagram size={28} />
           </a>
           <a href="https://twitter.com" className="social-link2" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
             <FaTwitter size={28} />
           </a>
           <a href="https://facebook.com" className="social-link3" aria-label="facebook" target="_blank" rel="noopener noreferrer">
             <FaFacebook size={28} />
           </a>

         </div>
       </StyledWrapper>
     );
   };
   
   const StyledWrapper = styled.div`
     .card {
       display: flex;
       justify-content: flex-start;
       align-items: center;
       width: 100%;
       max-width: 270px;
       height: 70px;
      background-color:transparent;
      flex-direction: row;
      border:none;
      gap:20px

     }
   
     .card a {
       color: white;
       transition: transform 0.3s ease;
     }
   
     .card a:hover {
       transform: scale(1.2);
     }
   `;
   
   export default LogoFooter;
   