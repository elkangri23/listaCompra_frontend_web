'use client';

import { useParams, useRouter } from 'next/navigation';
import styles from './invitation.module.css';

export default function PublicInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  // Mock data - replace with actual API call using token
  const inviterName = "Sophia";
  const listName = "Grocery Run";
  const previewItems = [
    "Milk",
    "Eggs",
    "Bread",
    "Butter",
    "Apples",
    "Chicken Breast",
    "Spinach",
    "Yogurt",
    "Coffee"
  ];

  const handleAcceptInvitation = () => {
    // TODO: Implement accept invitation logic with token
    alert('Funcionalidad de aceptar invitación (por implementar)');
    // router.push('/login'); // Redirect after accepting
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.contentContainer}>
            <div className={styles.heroSection}>
              <div className={styles.heroCard}>
                <div className={styles.heroContent}>
                  <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>
                      {inviterName} has invited you to collaborate on the shopping list &apos;{listName}&apos;
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.previewSection}>
              <div className={styles.previewCard}>
                <div className={styles.previewScroll}>
                  <p className={styles.previewTitle}>Sneak peek at your list items:</p>
                  <ul className={styles.previewList}>
                    {previewItems.map((item, index) => (
                      <li key={index} className={styles.previewItem}>
                        <span className={styles.previewDot}></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.previewFade}></div>
              </div>
              <p className={styles.previewHint}>
                Scroll to see a preview of the items on the list. Many more await!
              </p>
            </div>
          </div>

          <div className={styles.actionWrapper}>
            <button 
              className={styles.acceptButton}
              onClick={handleAcceptInvitation}
              aria-label="Accept invitation and join list"
            >
              <span>Accept and Join</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}