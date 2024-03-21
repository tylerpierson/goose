import { useState } from 'react'
import styles from './LikeBtn.module.scss'


export default function LikeBtn() {
 const [clicked, setClicked] = useState(false)


 const handleClick = () => {
   setClicked(!clicked)
 }


 return (
   <section>
     <ul className={styles.iconList}>
       <li className={styles.iconItem}>
         <button
           className={`${styles.iconLink} ${clicked ? styles.clicked : ''}`}
           onClick={handleClick}
         >
           ♡
         </button>
       </li>
     </ul>
   </section>
 )
}
