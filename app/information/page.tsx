"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import NextImage from 'next/image';
import logo from '../friendlerLogo.png';
import { Button } from "antd";

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <nav style={{
}}>
  <NextImage
    src={logo}
    alt="Friendler Logo"
    height={160}
    width={480}
  />
      </nav>

      <section style={{
        padding: '0rem 0rem 2rem',
        textAlign: 'center',
        maxWidth: '960px',
      }}>

        <h1 style={{
          fontSize: '35px',
          fontWeight: 500,
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
          marginBottom: '1rem',
        }}>
       What is Friendler?
        </h1>
        </section>

        <section style={{
      }}>
        <div style={{
          display: 'center',
          gap: '40px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {[
            {
              title: 'Focus on what you want to do with your friends, not when!',
              desc: `Who does not know the struggle, ever since getting older finding the time to meet up with your friends 
              became more difficult than winning the lottery. Friendler helps you overcome this problem. Once you created 
              a group you can invite your friends to join your group. As a member of a group, you can suggest activities 
              and can decide if you would like to join a activity or not. As soon as an activity meets the minimum required 
              participants and Friendler starts looking for a suitable date and time. Friendler uses your personal google 
              calendar or your manual entered dates to check for your availability. When Friendler finds a suitable time 
              for all participants it will automatically create an event in your calendar. Friendler also checks if the 
              weather is suitable (if relevant) and will reschedule if it does not meet the requirements.`,
            },

          ].map((feature) => (
            <div key={feature.title} style={{
              backgroundColor: '#02020220',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
            }}>
              <div style={{
                width: '36px',
                display:'flex',
                alignItems: 'left',
                }}>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#00000095', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
          
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px'}}>
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/')}
            style={{ backgroundColor: '#000000', borderRadius: '999px'}}
          >
            Back
          </Button>
          </div>
        </div>
      </section>


      <footer style={{
        padding: '2rem',
        paddingTop:'8rem',
        textAlign: 'center',
        fontSize: '13px',
        color: '#00000088',
        width: '100%',
        marginTop: '2rem',
      }}>
        Friendler · Group 36 · SoPra FS26
      </footer>
    </div>
  );
}
