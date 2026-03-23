import { LegalResponse, CrisisType } from '../types/crisis';

// 50 pre-computed offline crisis responses (10 per category)
export const OFFLINE_DATA: Array<{
  id: number;
  crisisType: string;
  phrase: string;
  rights: Array<{ description: string; sectionNumber: string; actName: string; actYear: number }>;
  scriptedPhrase: string;
}> = [
  // POLICE DETENTION (10)
  {
    id: 1, crisisType: 'POLICE_DETENTION', phrase: 'Police stopped me',
    rights: [
      { description: 'You must be told the grounds for your arrest immediately.', sectionNumber: '50', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You have the right to meet a lawyer during interrogation.', sectionNumber: '41D', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You cannot be detained for more than 24 hours without a magistrate\'s order.', sectionNumber: '57', actName: 'Code of Criminal Procedure', actYear: 1973 },
    ],
    scriptedPhrase: 'I am invoking my rights under Section 41D CrPC. I will not answer questions without my lawyer. Please show me the arrest memo as required by D.K. Basu guidelines.',
  },
  {
    id: 2, crisisType: 'POLICE_DETENTION', phrase: 'Police want to take me to station',
    rights: [
      { description: 'Police must follow D.K. Basu guidelines during arrest — memo, witness, medical exam.', sectionNumber: 'Guidelines', actName: 'D.K. Basu v. State of West Bengal', actYear: 1996 },
      { description: 'You have the right to inform a family member or friend of your detention.', sectionNumber: '50A', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'Your life and personal liberty are constitutionally protected.', sectionNumber: '21', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'Under Article 22 of the Constitution, I have the right to be informed of the grounds of arrest and to consult a lawyer. I request an arrest memo immediately.',
  },
  {
    id: 3, crisisType: 'POLICE_DETENTION', phrase: 'Police searching me without reason',
    rights: [
      { description: 'Police need a warrant or reasonable suspicion to search you.', sectionNumber: '100', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You cannot be arrested without warrant except in cognizable offences.', sectionNumber: '41', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You are protected against self-incrimination.', sectionNumber: '20(3)', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'I request you to show your authority to search me. I am a law-abiding citizen and I know my rights under Section 41 CrPC.',
  },
  {
    id: 4, crisisType: 'POLICE_DETENTION', phrase: 'Police threatening me',
    rights: [
      { description: 'Torture or inhuman treatment by police is unconstitutional.', sectionNumber: '21', actName: 'Constitution of India', actYear: 1950 },
      { description: 'You can file a complaint against police misconduct with the State Human Rights Commission.', sectionNumber: '17', actName: 'Protection of Human Rights Act', actYear: 1993 },
      { description: 'Forced confessions are inadmissible in court.', sectionNumber: '25', actName: 'Indian Evidence Act', actYear: 1872 },
    ],
    scriptedPhrase: 'I am recording that I am being threatened. Any forced statement is inadmissible under Section 25, Indian Evidence Act. I will be filing a complaint.',
  },
  {
    id: 5, crisisType: 'POLICE_DETENTION', phrase: 'Arrested without FIR',
    rights: [
      { description: 'Police must register an FIR for cognizable offences — refusing to do so is itself an offence.', sectionNumber: '154', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You can demand a copy of the FIR free of charge.', sectionNumber: '154(2)', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'No detention without legal grounds is permitted under constitutional law.', sectionNumber: '22', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'I demand to know the FIR number under which I am being detained. Arresting without FIR for non-cognizable offence is illegal. I request immediate release or production before magistrate.',
  },
  {
    id: 6, crisisType: 'POLICE_DETENTION', phrase: 'Police taking my phone',
    rights: [
      { description: 'Seizure of property must follow prescribed procedures and give you a seizure memo.', sectionNumber: '102', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You have the right to a copy of the seizure list.', sectionNumber: '100(5)', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'Arbitrary seizure violates your right to property.', sectionNumber: '300A', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'Before seizing my phone, please provide a seizure memo with list of items as required by Section 102 CrPC. I will need a copy of this memo.',
  },
  {
    id: 7, crisisType: 'POLICE_DETENTION', phrase: 'Police asking me to sign document',
    rights: [
      { description: 'You cannot be compelled to be a witness against yourself.', sectionNumber: '20(3)', actName: 'Constitution of India', actYear: 1950 },
      { description: 'Statements made to police are not evidence unless made before a magistrate.', sectionNumber: '162', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You have the right to read and understand any document before signing.', sectionNumber: '41D', actName: 'Code of Criminal Procedure', actYear: 1973 },
    ],
    scriptedPhrase: 'I request to read this document carefully with my lawyer present before signing. I cannot be compelled to sign under Article 20(3) of the Constitution.',
  },
  {
    id: 8, crisisType: 'POLICE_DETENTION', phrase: 'Detained overnight without charge',
    rights: [
      { description: 'You must be produced before a magistrate within 24 hours of arrest.', sectionNumber: '57', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'Detention beyond 24 hours without magistrate order is illegal.', sectionNumber: '22(2)', actName: 'Constitution of India', actYear: 1950 },
      { description: 'You can apply for bail in most bailable offences automatically.', sectionNumber: '436', actName: 'Code of Criminal Procedure', actYear: 1973 },
    ],
    scriptedPhrase: 'I have been detained for more than 24 hours. This is illegal under Section 57 CrPC and Article 22 of the Constitution. I demand to be produced before the magistrate immediately.',
  },
  {
    id: 9, crisisType: 'POLICE_DETENTION', phrase: 'Police demanding bribe',
    rights: [
      { description: 'Demanding a bribe is a criminal offence under Prevention of Corruption Act.', sectionNumber: '7', actName: 'Prevention of Corruption Act', actYear: 1988 },
      { description: 'You can report corruption to the Anti-Corruption Bureau or Vigilance.', sectionNumber: '17A', actName: 'Prevention of Corruption Act', actYear: 1988 },
      { description: 'No public servant can demand or accept a bribe for official duties.', sectionNumber: '13', actName: 'Prevention of Corruption Act', actYear: 1988 },
    ],
    scriptedPhrase: 'Demanding money from me is an offence under Section 7, Prevention of Corruption Act. I will be reporting this to the Anti-Corruption Bureau immediately.',
  },
  {
    id: 10, crisisType: 'POLICE_DETENTION', phrase: 'Police not following arrest procedure',
    rights: [
      { description: 'Arrest procedures must follow D.K. Basu guidelines — memo, medical exam, family notification.', sectionNumber: 'Guidelines', actName: 'D.K. Basu v. State of West Bengal', actYear: 1996 },
      { description: 'The arresting officer must show their badge and identification.', sectionNumber: '41B', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'Any violation of arrest procedures can lead to the arrest being declared illegal by the court.', sectionNumber: '21', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'Please follow D.K. Basu guidelines. Show your identification, provide an arrest memo, and inform my family as required by Section 41B CrPC.',
  },

  // DOMESTIC VIOLENCE (10)
  {
    id: 11, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Husband is beating me',
    rights: [
      { description: 'You have the right to get a protection order from a magistrate.', sectionNumber: '18', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'You cannot be removed from the shared household.', sectionNumber: '17', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'Cruelty by husband is a criminal offence punishable with up to 3 years imprisonment.', sectionNumber: '498A', actName: 'Indian Penal Code', actYear: 1860 },
    ],
    scriptedPhrase: 'I am invoking my rights under the Protection of Women from Domestic Violence Act 2005. I will be approaching the magistrate for a protection order. This is criminal under Section 498A IPC.',
  },
  {
    id: 12, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'In-laws threatening me',
    rights: [
      { description: 'Protection from domestic violence covers relatives of the husband including in-laws.', sectionNumber: '2(q)', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'You can file a complaint with a Protection Officer in your area.', sectionNumber: '12', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'Assault or criminal intimidation is a cognizable offence.', sectionNumber: '354', actName: 'Indian Penal Code', actYear: 1860 },
    ],
    scriptedPhrase: 'I am filing a complaint against all family members involved under PWDVA 2005. This behaviour constitutes domestic violence under Section 3 of the Act.',
  },
  {
    id: 13, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Husband won\'t give me money',
    rights: [
      { description: 'You have the right to maintenance under the PWDVA including monetary relief.', sectionNumber: '20', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'Maintenance can also be claimed under Section 125 of CrPC.', sectionNumber: '125', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'Economic abuse is recognized as domestic violence under the act.', sectionNumber: '3', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
    ],
    scriptedPhrase: 'Withholding money is economic abuse under Section 3 PWDVA. I have the right to claim monetary relief under Section 20 of the same act through the magistrate.',
  },
  {
    id: 14, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Being forced out of house',
    rights: [
      { description: 'You have the right to continue living in the shared household regardless of ownership.', sectionNumber: '17', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'A magistrate can pass a residence order protecting your right to stay.', sectionNumber: '19', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'Forcibly removing you without court order is illegal.', sectionNumber: '18', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
    ],
    scriptedPhrase: 'Under Section 17 PWDVA, I have an absolute right to reside in this shared household. Forcing me to leave without a court order is an offence under this Act.',
  },
  {
    id: 15, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Dowry demand threatening me',
    rights: [
      { description: 'Demanding dowry is a criminal offence under the Dowry Prohibition Act.', sectionNumber: '3', actName: 'Dowry Prohibition Act', actYear: 1961 },
      { description: 'Cruelty for dowry is punishable with up to 3 years and fine.', sectionNumber: '498A', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'You can approach any police station or protection officer to file a complaint.', sectionNumber: '12', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
    ],
    scriptedPhrase: 'Demanding dowry is a criminal offence under Section 3, Dowry Prohibition Act 1961. I will be filing a complaint under Section 498A IPC and PWDVA 2005.',
  },
  {
    id: 16, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Abused by family member',
    rights: [
      { description: 'Domestic violence covers physical, sexual, verbal, emotional, and economic abuse.', sectionNumber: '3', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'You can approach a protection officer, service provider, or police for help.', sectionNumber: '4', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'Free legal aid is available through NALSA for domestic violence victims.', sectionNumber: '12', actName: 'Legal Services Authorities Act', actYear: 1987 },
    ],
    scriptedPhrase: 'I am reporting domestic violence under Section 3 PWDVA. I need to speak with a protection officer immediately and access free legal aid through NALSA.',
  },
  {
    id: 17, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Husband won\'t let me leave house',
    rights: [
      { description: 'Restricting your movement is wrongful confinement, a criminal offence.', sectionNumber: '340', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'Physical or psychological control is domestic violence under PWDVA.', sectionNumber: '3', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'Right to liberty and freedom of movement is constitutionally guaranteed.', sectionNumber: '21', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'Preventing me from leaving constitutes wrongful confinement under Section 340 IPC and domestic violence under PWDVA 2005. I am calling for help immediately.',
  },
  {
    id: 18, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Threatened with weapons at home',
    rights: [
      { description: 'Criminal intimidation with a weapon is a serious cognizable offence.', sectionNumber: '506', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'You can call 100 (police) or 181 (women helpline) for immediate help.', sectionNumber: '18', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'A magistrate can pass an emergency protection order same day.', sectionNumber: '12', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
    ],
    scriptedPhrase: 'I am in immediate danger. Threatening me with a weapon is criminal intimidation under Section 506 IPC. I am calling 100 and 181 immediately.',
  },
  {
    id: 19, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Child being abused too',
    rights: [
      { description: 'Child abuse is punishable under the Protection of Children from Sexual Offences Act.', sectionNumber: '4', actName: 'Protection of Children from Sexual Offences Act', actYear: 2012 },
      { description: 'Any person aware of abuse must report it to police or child welfare committee.', sectionNumber: '19', actName: 'Protection of Children from Sexual Offences Act', actYear: 2012 },
      { description: 'Children have the right to protection under Article 15(3) of the Constitution.', sectionNumber: '15(3)', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'Child abuse is a mandatory reportable crime under POCSO Act. I am reporting this to police and the Child Welfare Committee for immediate protection.',
  },
  {
    id: 20, crisisType: 'DOMESTIC_VIOLENCE', phrase: 'Sexual violence at home',
    rights: [
      { description: 'Sexual abuse within marriage is recognized as domestic violence under PWDVA.', sectionNumber: '3(a)', actName: 'Protection of Women from Domestic Violence Act', actYear: 2005 },
      { description: 'You can file an FIR at any police station including women-only stations.', sectionNumber: '154', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'The statement of a rape victim is recorded by a female officer with a magistrate.', sectionNumber: '164A', actName: 'Code of Criminal Procedure', actYear: 1973 },
    ],
    scriptedPhrase: 'Sexual violence including within marriage is domestic violence under Section 3(a) PWDVA. I am filing an FIR at the nearest police station under Section 376 IPC.',
  },

  // EVICTION (10)
  {
    id: 21, crisisType: 'EVICTION', phrase: 'Landlord asking me to leave immediately',
    rights: [
      { description: 'Landlord must give proper notice before eviction — 15 days for month-to-month tenancy.', sectionNumber: '106', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'Forcible eviction without court order is illegal and constitutes criminal trespass.', sectionNumber: '441', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'You can get an injunction from civil court to stay the eviction.', sectionNumber: '38', actName: 'Specific Relief Act', actYear: 1963 },
    ],
    scriptedPhrase: 'Under Section 106 of the Transfer of Property Act, you must give me legal notice before eviction. Forcible removal is criminal trespass under Section 441 IPC. I will seek a court injunction.',
  },
  {
    id: 22, crisisType: 'EVICTION', phrase: 'Landlord changed the locks',
    rights: [
      { description: 'Changing locks without court order is illegal eviction and criminal trespass.', sectionNumber: '441', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'You can approach the Rent Control Court for restoration of possession.', sectionNumber: '10', actName: 'Tamil Nadu Buildings (Lease and Rent Control) Act', actYear: 1960 },
      { description: 'Your right to residence is protected by law as long as rent is paid.', sectionNumber: '108', actName: 'Transfer of Property Act', actYear: 1882 },
    ],
    scriptedPhrase: 'Changing my locks without a court eviction order is criminal trespass under Section 441 IPC. I am calling police and approaching the Rent Control Court for restoration of possession.',
  },
  {
    id: 23, crisisType: 'EVICTION', phrase: 'No rental agreement but told to leave',
    rights: [
      { description: 'Tenancy can be oral — absence of written agreement does not eliminate tenant rights.', sectionNumber: '106', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'Proper notice is still required regardless of written agreement.', sectionNumber: '106', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'Rent receipts or payment proof establishes tenancy even without agreement.', sectionNumber: '108', actName: 'Transfer of Property Act', actYear: 1882 },
    ],
    scriptedPhrase: 'My tenancy is valid even without a written agreement under Section 106 Transfer of Property Act. You must provide proper notice before any eviction proceedings.',
  },
  {
    id: 24, crisisType: 'EVICTION', phrase: 'Landlord cutting water and electricity',
    rights: [
      { description: 'Cutting utilities to force eviction is harassment and illegal.', sectionNumber: '108(e)', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'You can file a police complaint for this form of harassment.', sectionNumber: '503', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'Civil court can order restoration of utilities pending eviction proceedings.', sectionNumber: '38', actName: 'Specific Relief Act', actYear: 1963 },
    ],
    scriptedPhrase: 'Cutting utilities to force me out is harassment under Section 503 IPC and a violation of my rights under Section 108(e) Transfer of Property Act. I will file a police complaint.',
  },
  {
    id: 25, crisisType: 'EVICTION', phrase: 'Evicted because of religion or caste',
    rights: [
      { description: 'Discrimination in tenancy based on religion or caste is unconstitutional.', sectionNumber: '15', actName: 'Constitution of India', actYear: 1950 },
      { description: 'Discrimination based on caste in access to housing is an offence under SC/ST Prevention of Atrocities Act.', sectionNumber: '3', actName: 'SC/ST Prevention of Atrocities Act', actYear: 1989 },
      { description: 'You can file a human rights complaint with the State Human Rights Commission.', sectionNumber: '17', actName: 'Protection of Human Rights Act', actYear: 1993 },
    ],
    scriptedPhrase: 'Evicting me due to my caste or religion violates Article 15 of the Constitution and the SC/ST Prevention of Atrocities Act. I will report this discrimination to the appropriate authority.',
  },
  {
    id: 26, crisisType: 'EVICTION', phrase: 'Landlord taking my belongings',
    rights: [
      { description: 'Taking your belongings without court order is theft.', sectionNumber: '378', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'A landlord has no right to seize your personal property to recover rent.', sectionNumber: '108', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'You can file an FIR for theft against the landlord.', sectionNumber: '154', actName: 'Code of Criminal Procedure', actYear: 1973 },
    ],
    scriptedPhrase: 'Taking my belongings without a court order is theft under Section 378 IPC. I demand return of my property and will file an FIR against you.',
  },
  {
    id: 27, crisisType: 'EVICTION', phrase: 'Not getting security deposit back',
    rights: [
      { description: 'Security deposit must be returned within the agreed time after vacating.', sectionNumber: '108', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'Wrongful withholding of deposit can be recovered through consumer forum.', sectionNumber: '35', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You can send a legal notice demanding return of deposit with interest.', sectionNumber: '415', actName: 'Indian Penal Code', actYear: 1860 },
    ],
    scriptedPhrase: 'I am sending a legal notice for return of my security deposit under Section 108 TPA. If not returned in 7 days, I will approach the Consumer Forum for recovery with interest.',
  },
  {
    id: 28, crisisType: 'EVICTION', phrase: 'Landlord threatening physical harm',
    rights: [
      { description: 'Threatening physical harm is criminal intimidation.', sectionNumber: '506', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'You can file an FIR or seek police protection immediately.', sectionNumber: '154', actName: 'Code of Criminal Procedure', actYear: 1973 },
      { description: 'You can get a restraining order from the civil court against the landlord.', sectionNumber: '38', actName: 'Specific Relief Act', actYear: 1963 },
    ],
    scriptedPhrase: 'Threatening me with physical harm is criminal intimidation under Section 506 IPC — a cognizable offence. I am calling 100 to file an FIR against you right now.',
  },
  {
    id: 29, crisisType: 'EVICTION', phrase: 'Landlord entering home without permission',
    rights: [
      { description: 'Landlord cannot enter your rented premises without prior notice except in emergency.', sectionNumber: '108', actName: 'Transfer of Property Act', actYear: 1882 },
      { description: 'Unauthorized entry into your residence is trespass.', sectionNumber: '441', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'You have the right to privacy in your home guaranteed by the Constitution.', sectionNumber: '21', actName: 'Constitution of India', actYear: 1950 },
    ],
    scriptedPhrase: 'Entering my home without notice violates Section 108 TPA and constitutes trespass under Section 441 IPC. I am filing a police complaint for this intrusion.',
  },
  {
    id: 30, crisisType: 'EVICTION', phrase: 'Eviction during pregnancy or illness',
    rights: [
      { description: 'Courts can stay eviction execution on humanitarian grounds.', sectionNumber: '38', actName: 'Specific Relief Act', actYear: 1963 },
      { description: 'Right to life includes right to shelter and basic housing.', sectionNumber: '21', actName: 'Constitution of India', actYear: 1950 },
      { description: 'You can approach the Rent Control Court to delay execution of eviction order.', sectionNumber: '10', actName: 'Tamil Nadu Buildings (Lease and Rent Control) Act', actYear: 1960 },
    ],
    scriptedPhrase: 'I am pregnant/seriously ill and enforcement of eviction at this time endangers my life under Article 21 of the Constitution. I am seeking a stay of eviction from the court.',
  },

  // SALARY THEFT (10)
  {
    id: 31, crisisType: 'SALARY_THEFT', phrase: 'Boss not paying my salary',
    rights: [
      { description: 'Wages must be paid within 7 days of the wage period for small establishments.', sectionNumber: '5', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'You can file a claim with the Payment of Wages Authority for unpaid wages.', sectionNumber: '15', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'Minimum wage must be paid regardless of agreement.', sectionNumber: '12', actName: 'Minimum Wages Act', actYear: 1948 },
    ],
    scriptedPhrase: 'Under Section 5, Payment of Wages Act 1936, my salary must be paid within 7 days. I am filing a claim with the Payment of Wages Authority for all unpaid wages with compensation.',
  },
  {
    id: 32, crisisType: 'SALARY_THEFT', phrase: 'Company holding salary for notice period',
    rights: [
      { description: 'Only actual notice period salary can be deducted, not additional amounts.', sectionNumber: '7', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'Unauthorized deductions from wages are illegal.', sectionNumber: '7(2)', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'You can recover withheld salary through the Labour Commissioner.', sectionNumber: '15', actName: 'Payment of Wages Act', actYear: 1936 },
    ],
    scriptedPhrase: 'Withholding salary beyond the contracted notice period is an illegal deduction under Section 7(2) Payment of Wages Act. I will file a complaint with the Labour Commissioner.',
  },
  {
    id: 33, crisisType: 'SALARY_THEFT', phrase: 'Fired without notice or pay',
    rights: [
      { description: 'Employers must pay one month notice pay or give one month notice before termination.', sectionNumber: '25F', actName: 'Industrial Disputes Act', actYear: 1947 },
      { description: 'All dues including pending salary must be settled on the last working day.', sectionNumber: '5', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'You can file a dispute before the Labour Tribunal for compensation.', sectionNumber: '2A', actName: 'Industrial Disputes Act', actYear: 1947 },
    ],
    scriptedPhrase: 'Terminating without notice or pay violates Section 25F of the Industrial Disputes Act. I am filing a dispute with the Labour Tribunal for my notice pay and all dues.',
  },
  {
    id: 34, crisisType: 'SALARY_THEFT', phrase: 'Employer paying below minimum wage',
    rights: [
      { description: 'No employer can pay below the state-notified minimum wage.', sectionNumber: '12', actName: 'Minimum Wages Act', actYear: 1948 },
      { description: 'Violation of minimum wage is punishable with imprisonment and fine.', sectionNumber: '22', actName: 'Minimum Wages Act', actYear: 1948 },
      { description: 'You can file a complaint with the Labour Inspector immediately.', sectionNumber: '20', actName: 'Minimum Wages Act', actYear: 1948 },
    ],
    scriptedPhrase: 'Paying below minimum wage is an offence under Section 22 Minimum Wages Act, punishable with 6 months imprisonment. I am filing a complaint with the Labour Inspector today.',
  },
  {
    id: 35, crisisType: 'SALARY_THEFT', phrase: 'PF not deposited by employer',
    rights: [
      { description: 'Employer must deposit PF contributions within 15 days of wage month end.', sectionNumber: '36', actName: 'Employees Provident Fund Act', actYear: 1952 },
      { description: 'Non-deposit of PF is a criminal offence.', sectionNumber: '14', actName: 'Employees Provident Fund Act', actYear: 1952 },
      { description: 'You can file a complaint with EPFO regional office for non-deposit.', sectionNumber: '7A', actName: 'Employees Provident Fund Act', actYear: 1952 },
    ],
    scriptedPhrase: 'Non-deposit of PF is a criminal offence under Section 14 EPF Act punishable with 3 years imprisonment. I am filing a complaint with the EPFO regional office immediately.',
  },
  {
    id: 36, crisisType: 'SALARY_THEFT', phrase: 'Threatened to not pay if I complain',
    rights: [
      { description: 'Victimizing an employee for filing a legal complaint is illegal.', sectionNumber: '25T', actName: 'Industrial Disputes Act', actYear: 1947 },
      { description: 'Threatening employees is criminal intimidation.', sectionNumber: '506', actName: 'Indian Penal Code', actYear: 1860 },
      { description: 'Whistleblower protection exists for employees who report labour violations.', sectionNumber: '3', actName: 'Whistle Blowers Protection Act', actYear: 2014 },
    ],
    scriptedPhrase: 'Threatening me for exercising my legal rights is victimization under Section 25T Industrial Disputes Act and criminal intimidation under Section 506 IPC. I am filing a complaint.',
  },
  {
    id: 37, crisisType: 'SALARY_THEFT', phrase: 'Employer making illegal deductions',
    rights: [
      { description: 'Only specified deductions are allowed — tax, PF, fines with consent.', sectionNumber: '7', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'Unauthorized deductions can be recovered through the Wages Authority.', sectionNumber: '15', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'Fines cannot exceed 3% of wages in any wage period.', sectionNumber: '8', actName: 'Payment of Wages Act', actYear: 1936 },
    ],
    scriptedPhrase: 'These deductions are unauthorized under Section 7 Payment of Wages Act. I am filing a claim for recovery of all illegal deductions with interest within 7 days.',
  },
  {
    id: 38, crisisType: 'SALARY_THEFT', phrase: 'Contract worker wages unpaid',
    rights: [
      { description: 'Contract workers have the right to wages from principal employer if contractor defaults.', sectionNumber: '21', actName: 'Contract Labour (Regulation and Abolition) Act', actYear: 1970 },
      { description: 'Principal employer is liable to pay wages if contractor fails.', sectionNumber: '21', actName: 'Contract Labour (Regulation and Abolition) Act', actYear: 1970 },
      { description: 'You can file a claim with the Labour Commissioner against both contractor and principal employer.', sectionNumber: '15', actName: 'Payment of Wages Act', actYear: 1936 },
    ],
    scriptedPhrase: 'Under Section 21 Contract Labour Act, the principal employer is liable for my wages if the contractor defaults. I am filing a claim against both the contractor and principal employer.',
  },
  {
    id: 39, crisisType: 'SALARY_THEFT', phrase: 'Not given payslip or salary records',
    rights: [
      { description: 'Employer must give payslips showing all deductions made from salary.', sectionNumber: '14', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'Failure to maintain wage records is an offence.', sectionNumber: '13A', actName: 'Payment of Wages Act', actYear: 1936 },
      { description: 'You can demand wage records from the employer in writing.', sectionNumber: '13', actName: 'Payment of Wages Act', actYear: 1936 },
    ],
    scriptedPhrase: 'You are legally required to provide payslips under Section 14 Payment of Wages Act. I formally demand my wage records in writing. Failure is an offence under Section 13A.',
  },
  {
    id: 40, crisisType: 'SALARY_THEFT', phrase: 'Overtime not paid',
    rights: [
      { description: 'Overtime work must be paid at double the ordinary rate of wages.', sectionNumber: '59', actName: 'Factories Act', actYear: 1948 },
      { description: 'Workers cannot be made to work more than 48 hours a week without overtime pay.', sectionNumber: '51', actName: 'Factories Act', actYear: 1948 },
      { description: 'You can file a complaint with the Labour Inspector for overtime wage recovery.', sectionNumber: '63', actName: 'Factories Act', actYear: 1948 },
    ],
    scriptedPhrase: 'Overtime wages at double rate are mandatory under Section 59 Factories Act. I am filing a complaint with the Labour Inspector for all unpaid overtime.',
  },

  // CONSUMER FRAUD (10)
  {
    id: 41, crisisType: 'CONSUMER_FRAUD', phrase: 'Bought fake product online',
    rights: [
      { description: 'You have the right to file a consumer complaint for defective or counterfeit goods.', sectionNumber: '35', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'E-commerce platforms are liable for goods sold through them.', sectionNumber: '94', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You are entitled to a refund including delivery charges for fake products.', sectionNumber: '38', actName: 'Consumer Protection Act', actYear: 2019 },
    ],
    scriptedPhrase: 'This is a counterfeit product. Under Section 35 Consumer Protection Act 2019, I am filing a complaint with the District Consumer Forum for refund plus compensation for deficiency in service.',
  },
  {
    id: 42, crisisType: 'CONSUMER_FRAUD', phrase: 'Company refusing to refund',
    rights: [
      { description: 'Refusing a valid refund for defective goods is deficiency in service.', sectionNumber: '2(11)', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You can file a complaint in district consumer commission for amounts up to 1 crore.', sectionNumber: '35', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You are entitled to refund, replacement, or repair for deficient services.', sectionNumber: '38(11)', actName: 'Consumer Protection Act', actYear: 2019 },
    ],
    scriptedPhrase: 'Refusing refund for defective goods is deficiency in service under Consumer Protection Act 2019. I am filing a formal complaint with the District Consumer Commission.',
  },
  {
    id: 43, crisisType: 'CONSUMER_FRAUD', phrase: 'Bank account hacked money stolen',
    rights: [
      { description: 'You can report unauthorized transactions to your bank within 3 days for zero liability.', sectionNumber: '3', actName: 'RBI Circular on Customer Protection', actYear: 2017 },
      { description: 'Online fraud is a criminal offence.', sectionNumber: '66C', actName: 'Information Technology Act', actYear: 2000 },
      { description: 'File cybercrime complaint at cybercrime.gov.in or nearest cyber police station.', sectionNumber: '66D', actName: 'Information Technology Act', actYear: 2000 },
    ],
    scriptedPhrase: 'I am reporting unauthorized transaction to the bank immediately under RBI circular for zero liability. I am filing a cybercrime complaint under Section 66C IT Act — fraud is a criminal offence.',
  },
  {
    id: 44, crisisType: 'CONSUMER_FRAUD', phrase: 'Online shopping scam lost money',
    rights: [
      { description: 'E-commerce platforms must have a grievance redressal mechanism.', sectionNumber: '17', actName: 'Consumer Protection (E-Commerce) Rules', actYear: 2020 },
      { description: 'You can report online fraud to cybercrime.gov.in or 1930 helpline.', sectionNumber: '66D', actName: 'Information Technology Act', actYear: 2000 },
      { description: 'File a consumer complaint for refund within 2 years of the cause of action.', sectionNumber: '35', actName: 'Consumer Protection Act', actYear: 2019 },
    ],
    scriptedPhrase: 'I am reporting this fraud to the cybercrime helpline 1930 and filing a consumer complaint under the Consumer Protection (E-Commerce) Rules 2020 for immediate refund.',
  },
  {
    id: 45, crisisType: 'CONSUMER_FRAUD', phrase: 'Builder cheating me on apartment',
    rights: [
      { description: 'Builders must register projects under RERA and follow timelines.', sectionNumber: '3', actName: 'Real Estate (Regulation and Development) Act', actYear: 2016 },
      { description: 'Delayed possession entitles you to compensation at prescribed rate.', sectionNumber: '18', actName: 'Real Estate (Regulation and Development) Act', actYear: 2016 },
      { description: 'You can file a complaint with the State RERA Authority.', sectionNumber: '31', actName: 'Real Estate (Regulation and Development) Act', actYear: 2016 },
    ],
    scriptedPhrase: 'Under Section 18 RERA 2016, I am entitled to full refund with interest for delayed possession. I am filing a complaint with the State RERA Authority for compensation.',
  },
  {
    id: 46, crisisType: 'CONSUMER_FRAUD', phrase: 'Medical negligence cheated',
    rights: [
      { description: 'Medical negligence resulting in harm is deficiency in service.', sectionNumber: '2(11)', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You can file a complaint against hospital or doctor in consumer forum.', sectionNumber: '35', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'Severe medical negligence is also a criminal offence.', sectionNumber: '304A', actName: 'Indian Penal Code', actYear: 1860 },
    ],
    scriptedPhrase: 'Medical negligence is deficiency in service under Consumer Protection Act 2019. I am filing a complaint with the Consumer Commission and reporting to the State Medical Council.',
  },
  {
    id: 47, crisisType: 'CONSUMER_FRAUD', phrase: 'Insurance company not paying claim',
    rights: [
      { description: 'Insurance companies cannot unreasonably reject valid claims.', sectionNumber: '45', actName: 'Insurance Act', actYear: 1938 },
      { description: 'Rejection of valid claim is deficiency in service — file consumer complaint.', sectionNumber: '35', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You can approach the Insurance Ombudsman for claims up to 30 lakhs.', sectionNumber: '17', actName: 'Insurance Ombudsman Rules', actYear: 2017 },
    ],
    scriptedPhrase: 'Wrongful rejection of my valid insurance claim is deficiency in service. I am approaching the Insurance Ombudsman and simultaneously filing a consumer complaint.',
  },
  {
    id: 48, crisisType: 'CONSUMER_FRAUD', phrase: 'UPI fraud money transferred',
    rights: [
      { description: 'Immediately report UPI fraud to your bank and the National Cyber Crime helpline 1930.', sectionNumber: '66C', actName: 'Information Technology Act', actYear: 2000 },
      { description: 'Banks must investigate fraud complaints within 90 days.', sectionNumber: '5', actName: 'RBI Circular on Customer Protection', actYear: 2017 },
      { description: 'You can file a police FIR after reporting to the bank and cyber crime portal.', sectionNumber: '154', actName: 'Code of Criminal Procedure', actYear: 1973 },
    ],
    scriptedPhrase: 'Reporting UPI fraud immediately to bank and 1930 helpline. Under RBI guidelines, I am entitled to zero liability if reported within 3 days. Filing FIR for online fraud under Section 66C IT Act.',
  },
  {
    id: 49, crisisType: 'CONSUMER_FRAUD', phrase: 'Misleading advertisement cheated',
    rights: [
      { description: 'False or misleading advertisements are prohibited and actionable.', sectionNumber: '2(28)', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You can file complaint with Central Consumer Protection Authority against misleading ads.', sectionNumber: '21', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'Manufacturer/brand is liable for false claims made in advertising.', sectionNumber: '89', actName: 'Consumer Protection Act', actYear: 2019 },
    ],
    scriptedPhrase: 'Misleading advertising that induced my purchase is an offence under Section 89, Consumer Protection Act 2019. I am filing a complaint with the Central Consumer Protection Authority.',
  },
  {
    id: 50, crisisType: 'CONSUMER_FRAUD', phrase: 'Service not provided after payment',
    rights: [
      { description: 'Non-provision of paid service is deficiency in service under consumer law.', sectionNumber: '2(11)', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'You are entitled to full refund for service not rendered.', sectionNumber: '38', actName: 'Consumer Protection Act', actYear: 2019 },
      { description: 'Criminal breach of trust can be filed if there is dishonest intent.', sectionNumber: '406', actName: 'Indian Penal Code', actYear: 1860 },
    ],
    scriptedPhrase: 'Non-provision of paid service is deficiency in service under Consumer Protection Act 2019. I demand immediate refund or service delivery within 48 hours, or I will file a consumer complaint.',
  },
];
