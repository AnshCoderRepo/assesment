require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const colleges = [
  { name:'IIT Bombay', location:'Mumbai, Maharashtra', state:'Maharashtra', type:'IIT', established:1958, rating:4.8, fees_min:200000, fees_max:250000, website:'https://iitb.ac.in', description:'One of the most prestigious technical universities in Asia with world-class research facilities.', nirf_rank:3, accreditation:'NAAC A++', total_students:10000 },
  { name:'IIT Delhi', location:'New Delhi, Delhi', state:'Delhi', type:'IIT', established:1961, rating:4.8, fees_min:200000, fees_max:250000, website:'https://iitd.ac.in', description:'Premier institution known for innovation and industry linkages in the capital region.', nirf_rank:2, accreditation:'NAAC A++', total_students:8500 },
  { name:'IIT Madras', location:'Chennai, Tamil Nadu', state:'Tamil Nadu', type:'IIT', established:1959, rating:4.9, fees_min:200000, fees_max:250000, website:'https://iitm.ac.in', description:'NIRF Rank 1 institution with exceptional research output and startup ecosystem.', nirf_rank:1, accreditation:'NAAC A++', total_students:9000 },
  { name:'IIT Kanpur', location:'Kanpur, Uttar Pradesh', state:'Uttar Pradesh', type:'IIT', established:1959, rating:4.7, fees_min:200000, fees_max:250000, website:'https://iitk.ac.in', description:'Pioneering institute known for its liberal arts integration and research excellence.', nirf_rank:4, accreditation:'NAAC A++', total_students:8000 },
  { name:'IIT Kharagpur', location:'Kharagpur, West Bengal', state:'West Bengal', type:'IIT', established:1951, rating:4.7, fees_min:200000, fees_max:250000, website:'https://iitkgp.ac.in', description:'The oldest and largest IIT with 22 academic departments and 13 research centers.', nirf_rank:5, accreditation:'NAAC A++', total_students:12000 },
  { name:'BITS Pilani', location:'Pilani, Rajasthan', state:'Rajasthan', type:'Deemed', established:1964, rating:4.5, fees_min:450000, fees_max:520000, website:'https://bits-pilani.ac.in', description:'Top private technical university with strong industry partnerships and practice school program.', nirf_rank:25, accreditation:'NAAC A', total_students:14000 },
  { name:'NIT Trichy', location:'Tiruchirappalli, Tamil Nadu', state:'Tamil Nadu', type:'NIT', established:1964, rating:4.3, fees_min:130000, fees_max:160000, website:'https://nitt.edu', description:'Top-ranked NIT known for its strong placement record and academic rigor.', nirf_rank:9, accreditation:'NAAC A++', total_students:6000 },
  { name:'NIT Warangal', location:'Warangal, Telangana', state:'Telangana', type:'NIT', established:1959, rating:4.2, fees_min:125000, fees_max:155000, website:'https://nitw.ac.in', description:'One of the oldest NITs with excellent research output and industry connect.', nirf_rank:15, accreditation:'NAAC A++', total_students:5500 },
  { name:'NIT Surathkal', location:'Mangaluru, Karnataka', state:'Karnataka', type:'NIT', established:1960, rating:4.2, fees_min:120000, fees_max:150000, website:'https://nitk.ac.in', description:'Coastal NIT known for its scenic campus and quality technical education.', nirf_rank:17, accreditation:'NAAC A+', total_students:5000 },
  { name:'IIIT Hyderabad', location:'Hyderabad, Telangana', state:'Telangana', type:'IIIT', established:1998, rating:4.4, fees_min:300000, fees_max:350000, website:'https://iiit.ac.in', description:'Research-focused institute specializing in IT and computational natural sciences.', nirf_rank:35, accreditation:'NAAC A', total_students:3500 },
  { name:'Delhi Technological University', location:'New Delhi, Delhi', state:'Delhi', type:'Government', established:1941, rating:4.0, fees_min:150000, fees_max:180000, website:'https://dtu.ac.in', description:'One of the oldest and most reputed state technical universities in India.', nirf_rank:45, accreditation:'NAAC A', total_students:9000 },
  { name:'VIT Vellore', location:'Vellore, Tamil Nadu', state:'Tamil Nadu', type:'Deemed', established:1984, rating:3.9, fees_min:190000, fees_max:250000, website:'https://vit.ac.in', description:'One of the largest private universities with strong international collaborations.', nirf_rank:11, accreditation:'NAAC A++', total_students:50000 },
  { name:'Manipal Institute of Technology', location:'Manipal, Karnataka', state:'Karnataka', type:'Deemed', established:1957, rating:3.8, fees_min:300000, fees_max:380000, website:'https://manipal.edu', description:'Pioneer in private technical education with campuses across India and abroad.', nirf_rank:52, accreditation:'NAAC A+', total_students:16000 },
  { name:'Jadavpur University', location:'Kolkata, West Bengal', state:'West Bengal', type:'Government', established:1955, rating:4.1, fees_min:20000, fees_max:40000, website:'https://jadavpur.edu', description:'Premier state university known for its engineering and humanities programs.', nirf_rank:12, accreditation:'NAAC A', total_students:8000 },
  { name:'Anna University', location:'Chennai, Tamil Nadu', state:'Tamil Nadu', type:'Government', established:1978, rating:3.9, fees_min:50000, fees_max:90000, website:'https://annauniv.edu', description:'Premier technical university in Tamil Nadu affiliating hundreds of engineering colleges.', nirf_rank:20, accreditation:'NAAC A+', total_students:7000 },
  { name:'Thapar Institute of Engineering', location:'Patiala, Punjab', state:'Punjab', type:'Deemed', established:1956, rating:3.9, fees_min:350000, fees_max:400000, website:'https://thapar.edu', description:'Reputed deemed university with strong focus on research and industry collaboration.', nirf_rank:30, accreditation:'NAAC A', total_students:12000 },
  { name:'SRM Institute of Science and Technology', location:'Chennai, Tamil Nadu', state:'Tamil Nadu', type:'Deemed', established:1985, rating:3.7, fees_min:200000, fees_max:320000, website:'https://srmist.edu.in', description:'Large private university with strong placement cell and modern infrastructure.', nirf_rank:55, accreditation:'NAAC A++', total_students:52000 },
  { name:'Amity University', location:'Noida, Uttar Pradesh', state:'Uttar Pradesh', type:'Private', established:2005, rating:3.5, fees_min:200000, fees_max:400000, website:'https://amity.edu', description:'Multi-disciplinary private university with campuses across India and abroad.', nirf_rank:75, accreditation:'NAAC A+', total_students:125000 },
  { name:'Lovely Professional University', location:'Phagwara, Punjab', state:'Punjab', type:'Private', established:2005, rating:3.4, fees_min:150000, fees_max:280000, website:'https://lpu.in', description:'One of the largest private universities known for diverse programs and placement drives.', nirf_rank:80, accreditation:'NAAC A+', total_students:30000 },
  { name:'Christ University', location:'Bengaluru, Karnataka', state:'Karnataka', type:'Deemed', established:1969, rating:3.8, fees_min:100000, fees_max:200000, website:'https://christuniversity.in', description:'Deemed university known for liberal arts, commerce and science programs.', nirf_rank:65, accreditation:'NAAC A++', total_students:25000 },
];

const coursesMap = {
  'IIT Bombay':    [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Electrical Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Data Science & AI',level:'PG',duration:2,annual_fee:240000},{name:'MBA',level:'PG',duration:2,annual_fee:250000}],
  'IIT Delhi':     [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Civil Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Chemical Engineering',level:'UG',duration:4,annual_fee:220000},{name:'M.Tech AI',level:'PG',duration:2,annual_fee:240000}],
  'IIT Madras':    [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Aerospace Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Naval Architecture',level:'UG',duration:4,annual_fee:220000},{name:'M.Tech Data Science',level:'PG',duration:2,annual_fee:240000}],
  'IIT Kanpur':    [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Physics',level:'UG',duration:4,annual_fee:220000},{name:'Mathematics & Scientific Computing',level:'UG',duration:4,annual_fee:220000}],
  'IIT Kharagpur': [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:220000},{name:'Architecture',level:'UG',duration:5,annual_fee:220000},{name:'MBA',level:'PG',duration:2,annual_fee:240000}],
  'BITS Pilani':   [{name:'Computer Science',level:'UG',duration:4,annual_fee:470000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:470000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:470000},{name:'M.Tech',level:'PG',duration:2,annual_fee:490000}],
  'NIT Trichy':    [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:140000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:140000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:140000},{name:'Civil Engineering',level:'UG',duration:4,annual_fee:140000}],
  'NIT Warangal':  [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:130000},{name:'Electrical Engineering',level:'UG',duration:4,annual_fee:130000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:130000}],
  'NIT Surathkal': [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:125000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:125000},{name:'Information Technology',level:'UG',duration:4,annual_fee:125000}],
  'IIIT Hyderabad':[{name:'Computer Science',level:'UG',duration:4,annual_fee:320000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:320000},{name:'M.Tech Computer Science',level:'PG',duration:2,annual_fee:340000}],
  'Delhi Technological University':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:160000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:160000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:160000}],
  'VIT Vellore':   [{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:210000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:210000},{name:'Biomedical Engineering',level:'UG',duration:4,annual_fee:210000},{name:'MBA',level:'PG',duration:2,annual_fee:230000}],
  'Manipal Institute of Technology':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:330000},{name:'Information Technology',level:'UG',duration:4,annual_fee:330000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:330000}],
  'Jadavpur University':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:25000},{name:'Electrical Engineering',level:'UG',duration:4,annual_fee:25000},{name:'Chemical Engineering',level:'UG',duration:4,annual_fee:25000}],
  'Anna University':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:60000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:60000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:60000}],
  'Thapar Institute of Engineering':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:360000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:360000},{name:'Mechanical Engineering',level:'UG',duration:4,annual_fee:360000}],
  'SRM Institute of Science and Technology':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:220000},{name:'Electronics & Communication',level:'UG',duration:4,annual_fee:220000},{name:'Biotechnology',level:'UG',duration:4,annual_fee:200000}],
  'Amity University':[{name:'Computer Science',level:'UG',duration:4,annual_fee:220000},{name:'Business Administration',level:'UG',duration:3,annual_fee:200000},{name:'Law',level:'UG',duration:5,annual_fee:180000},{name:'MBA',level:'PG',duration:2,annual_fee:350000}],
  'Lovely Professional University':[{name:'Computer Science & Engineering',level:'UG',duration:4,annual_fee:170000},{name:'Business Administration',level:'UG',duration:3,annual_fee:150000},{name:'Fashion Design',level:'UG',duration:3,annual_fee:160000}],
  'Christ University':[{name:'Commerce',level:'UG',duration:3,annual_fee:110000},{name:'Computer Science',level:'UG',duration:3,annual_fee:120000},{name:'Psychology',level:'UG',duration:3,annual_fee:100000},{name:'MBA',level:'PG',duration:2,annual_fee:180000}],
};

const placementsMap = {
  'IIT Bombay':    [{year:2024,avg_package:28.5,highest_package:3.67,placement_pct:95.2,top_recruiters:['Google','Microsoft','Goldman Sachs','DE Shaw','Tower Research']}],
  'IIT Delhi':     [{year:2024,avg_package:27.8,highest_package:3.0,placement_pct:94.5,top_recruiters:['Google','Amazon','Qualcomm','Samsung','McKinsey']}],
  'IIT Madras':    [{year:2024,avg_package:29.1,highest_package:3.67,placement_pct:96.0,top_recruiters:['Google','Apple','Morgan Stanley','Optiver','Schlumberger']}],
  'IIT Kanpur':    [{year:2024,avg_package:26.5,highest_package:2.8,placement_pct:93.0,top_recruiters:['Microsoft','Amazon','Texas Instruments','Bain','BCG']}],
  'IIT Kharagpur': [{year:2024,avg_package:25.8,highest_package:2.4,placement_pct:92.5,top_recruiters:['Tata Steel','Google','Facebook','JP Morgan','Intel']}],
  'BITS Pilani':   [{year:2024,avg_package:22.5,highest_package:1.8,placement_pct:90.0,top_recruiters:['Google','Amazon','Oracle','Flipkart','Adobe']}],
  'NIT Trichy':    [{year:2024,avg_package:16.2,highest_package:1.2,placement_pct:88.5,top_recruiters:['Infosys','TCS','Wipro','L&T','Cognizant']}],
  'NIT Warangal':  [{year:2024,avg_package:15.8,highest_package:1.1,placement_pct:87.0,top_recruiters:['TCS','Wipro','HCL','Accenture','BHEL']}],
  'NIT Surathkal': [{year:2024,avg_package:15.5,highest_package:1.0,placement_pct:86.5,top_recruiters:['Infosys','TCS','Amazon','Microsoft','DRDO']}],
  'IIIT Hyderabad':[{year:2024,avg_package:20.5,highest_package:1.5,placement_pct:92.0,top_recruiters:['Google','Microsoft','Amazon','Uber','Apple']}],
  'Delhi Technological University':[{year:2024,avg_package:14.5,highest_package:0.9,placement_pct:82.0,top_recruiters:['TCS','Infosys','Wipro','HCL','Capgemini']}],
  'VIT Vellore':   [{year:2024,avg_package:8.5,highest_package:0.7,placement_pct:80.0,top_recruiters:['TCS','Infosys','Wipro','Accenture','Cognizant']}],
  'Manipal Institute of Technology':[{year:2024,avg_package:9.2,highest_package:0.65,placement_pct:78.0,top_recruiters:['Infosys','Wipro','TCS','HCL','Mphasis']}],
  'Jadavpur University':[{year:2024,avg_package:11.5,highest_package:0.8,placement_pct:85.0,top_recruiters:['TCS','Wipro','Infosys','ISRO','DRDO']}],
  'Anna University':[{year:2024,avg_package:7.5,highest_package:0.5,placement_pct:75.0,top_recruiters:['TCS','Infosys','Wipro','CTS','Tech Mahindra']}],
  'Thapar Institute of Engineering':[{year:2024,avg_package:10.5,highest_package:0.7,placement_pct:82.0,top_recruiters:['Amazon','Microsoft','Infosys','TCS','Wipro']}],
  'SRM Institute of Science and Technology':[{year:2024,avg_package:7.0,highest_package:0.45,placement_pct:72.0,top_recruiters:['TCS','Infosys','Wipro','Accenture','HCL']}],
  'Amity University':[{year:2024,avg_package:6.5,highest_package:0.4,placement_pct:68.0,top_recruiters:['Deloitte','KPMG','EY','TCS','Wipro']}],
  'Lovely Professional University':[{year:2024,avg_package:5.8,highest_package:0.35,placement_pct:65.0,top_recruiters:['TCS','Wipro','Infosys','Capgemini','HCL']}],
  'Christ University':[{year:2024,avg_package:6.2,highest_package:0.38,placement_pct:70.0,top_recruiters:['Deloitte','KPMG','PWC','EY','Accenture']}],
};

const reviewsData = [
  { college:'IIT Bombay', reviewer:'Rahul Sharma', rating:5, content:'Best experience of my life. World-class faculty and amazing peer learning environment.', pros:'Excellent faculty, great research opportunities, amazing alumni network', cons:'Very competitive and stressful at times', batch_year:2023 },
  { college:'IIT Bombay', reviewer:'Priya Patel', rating:4, content:'The curriculum is rigorous but extremely rewarding. Placements are top-notch.', pros:'Top companies visit, great infrastructure, vibrant campus life', cons:'High fees, extreme competition', batch_year:2024 },
  { college:'IIT Delhi', reviewer:'Amit Kumar', rating:5, content:'Being in the capital gives amazing internship and networking opportunities.', pros:'Location advantage, industry exposure, excellent placements', cons:'City life can be distracting', batch_year:2023 },
  { college:'NIT Trichy', reviewer:'Karthik S', rating:4, content:'Best NIT experience. Placements are solid and faculty is dedicated.', pros:'Good placements, affordable fees, quality education', cons:'Remote location, limited social life', batch_year:2024 },
  { college:'BITS Pilani', reviewer:'Sneha Joshi', rating:5, content:'The Practice School program is exceptional. You get real-world experience.', pros:'Practice School, dual degree options, great peer group', cons:'Very expensive, desert location can be tough', batch_year:2023 },
  { college:'VIT Vellore', reviewer:'Mohammed Akhtar', rating:3, content:'Good infrastructure but academics could be more rigorous.', pros:'Great infrastructure, large campus, good events', cons:'Too large, quality varies by department', batch_year:2024 },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Reading schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema created');

    // Clear existing data
    await client.query('TRUNCATE colleges, courses, placements, reviews, questions, answers, saved_colleges, saved_comparisons, users RESTART IDENTITY CASCADE');
    console.log('🗑️  Cleared existing data');

    // Seed colleges
    const collegeIdMap = {};
    for (const college of colleges) {
      const res = await client.query(
        `INSERT INTO colleges (name,location,state,type,established,rating,fees_min,fees_max,website,description,nirf_rank,accreditation,total_students)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [college.name,college.location,college.state,college.type,college.established,college.rating,
         college.fees_min,college.fees_max,college.website,college.description,college.nirf_rank,college.accreditation,college.total_students]
      );
      collegeIdMap[college.name] = res.rows[0].id;
    }
    console.log(`✅ Seeded ${colleges.length} colleges`);

    // Seed courses
    for (const [collegeName, courses] of Object.entries(coursesMap)) {
      const cid = collegeIdMap[collegeName];
      if (!cid) continue;
      for (const course of courses) {
        await client.query(
          'INSERT INTO courses (college_id,name,level,duration,annual_fee) VALUES ($1,$2,$3,$4,$5)',
          [cid, course.name, course.level, course.duration, course.annual_fee]
        );
      }
    }
    console.log('✅ Seeded courses');

    // Seed placements
    for (const [collegeName, placements] of Object.entries(placementsMap)) {
      const cid = collegeIdMap[collegeName];
      if (!cid) continue;
      for (const p of placements) {
        await client.query(
          'INSERT INTO placements (college_id,year,avg_package,highest_package,placement_pct,top_recruiters) VALUES ($1,$2,$3,$4,$5,$6)',
          [cid, p.year, p.avg_package, p.highest_package, p.placement_pct, p.top_recruiters]
        );
      }
    }
    console.log('✅ Seeded placements');

    // Seed a demo user
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('demo1234', 12);
    await client.query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3)',
      ['Demo User', 'demo@collegecompass.in', hash]
    );
    console.log('✅ Seeded demo user (demo@collegecompass.in / demo1234)');

    // Seed reviews
    for (const r of reviewsData) {
      const cid = collegeIdMap[r.college];
      if (!cid) continue;
      await client.query(
        'INSERT INTO reviews (college_id,reviewer_name,rating,content,pros,cons,batch_year) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [cid, r.reviewer, r.rating, r.content, r.pros, r.cons, r.batch_year]
      );
    }
    console.log('✅ Seeded reviews');

    // Seed sample Q&A
    const iitbId = collegeIdMap['IIT Bombay'];
    const nitId  = collegeIdMap['NIT Trichy'];
    const qRes = await client.query(
      "INSERT INTO questions (college_id,author_name,title,body) VALUES ($1,'Arjun Mehta','What is the hostel fee at IIT Bombay?','Can someone tell me the approximate hostel and mess charges per semester?') RETURNING id",
      [iitbId]
    );
    await client.query(
      "INSERT INTO answers (question_id,author_name,body) VALUES ($1,'Rahul Sharma','Hostel fee is approximately ₹15,000-20,000 per semester. Mess charges vary from ₹3,000-5,000 per month depending on the hostel.')",
      [qRes.rows[0].id]
    );
    const qRes2 = await client.query(
      "INSERT INTO questions (college_id,author_name,title,body) VALUES ($1,'Sneha Roy','How are the placements at NIT Trichy for CSE?','I am interested in software roles. What is the placement scenario like?') RETURNING id",
      [nitId]
    );
    await client.query(
      "INSERT INTO answers (question_id,author_name,body) VALUES ($1,'Karthik S','CSE placements at NIT Trichy are excellent. Most top IT companies visit. Average package is around 15-16 LPA and top companies like Microsoft, Amazon also recruit.')",
      [qRes2.rows[0].id]
    );
    console.log('✅ Seeded Q&A');

    console.log('\n🎉 Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
