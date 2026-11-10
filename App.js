import React, { useMemo, useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Image,
  StyleSheet, StatusBar, Platform, KeyboardAvoidingView, Alert
} from "react-native";

const COLORS = {
  ink: "#171717", muted: "#666666", faint: "#8A8A8A", accent: "#D93636", accentSoft: "#FFF0F0",
  line: "#E4E4E4", soft: "#F7F7F7", white: "#FFFFFF",
  dark: "#202020", warning: "#8A5A00", warningBg: "#FFF6E5",
  green: "#256344", greenBg: "#EAF5EE", red: "#9D3030", redBg: "#FCEEEE"
};

const initialItems = [
  { id:"L-1047", name:"Student ID card", type:"Lost", category:"Cards & IDs", location:"Arts Building · Lobby", date:"23 Oct 2026", status:"Reported", description:"White Northfield University student ID in a clear card holder." },
  { id:"L-1042", name:"Space gray MacBook Air", type:"Lost", category:"Electronics", location:"Engineering Hall · E204", date:"21 Oct 2026", status:"Possible Match", description:"13-inch space gray laptop in a plain charcoal sleeve. Last used during an afternoon seminar." },
  { id:"F-2084", name:"Black Sony headphones", type:"Found", category:"Electronics", location:"Main Library · Level 2", date:"22 Oct 2026", status:"Reported", description:"Black over-ear wireless headphones in a black zip case. Found on a study desk near the windows." },
  { id:"F-2083", name:"Silver house keys", type:"Found", category:"Keys", location:"Sports Center · Desk", date:"22 Oct 2026", status:"Reported", description:"A small set of silver keys handed in at the desk." },
  { id:"F-2081", name:"Navy Hydro Flask", type:"Found", category:"Bottles & drinkware", location:"Student Union · Café", date:"21 Oct 2026", status:"Claim Pending", description:"Navy water bottle with a small dent on the base." },
  { id:"F-2079", name:"Black over-ear headphones", type:"Found", category:"Electronics", location:"Student Union · Lounge", date:"20 Oct 2026", status:"Reported", description:"Black over-ear headphones left in the lounge." },
  { id:"F-2070", name:"Sony wireless headphones", type:"Found", category:"Electronics", location:"Engineering Hall · E101", date:"18 Oct 2026", status:"Reported", description:"Wireless headphones found in a classroom." },
  { id:"L-1031", name:"Casio scientific calculator", type:"Lost", category:"Electronics", location:"Science Center · S101", date:"16 Oct 2026", status:"Closed", description:"Scientific calculator with a black protective cover." }
];

const nav = [
  ["Home","⌂"],["Search Items","⌕"],["Report Lost Item","＋"],["Report Found Item","＋"],
  ["My Reports","▤"],["Notifications","♧"],["Profile","○"]
];

function Badge({ children, tone }) {
  const style = tone === "green" ? styles.badgeGreen : tone === "amber" ? styles.badgeAmber : tone === "red" ? styles.badgeRed : styles.badge;
  return <View style={[styles.badge, style]}><Text style={styles.badgeText}>{children}</Text></View>;
}
function Button({ title, onPress, secondary=false, disabled=false, accent=false, danger=false }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[
    styles.button, secondary && styles.buttonSecondary, accent && styles.buttonAccent, danger && styles.buttonDanger, disabled && {opacity:.45}, pressed && {opacity:.75}
  ]}><Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text></Pressable>;
}
function SectionTitle({ children, right, onRight }) {
  return <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{children}</Text>{right ? <Pressable onPress={onRight}><Text style={styles.link}>{right}</Text></Pressable> : null}</View>;
}
function Field({ label, value, onChangeText, placeholder, multiline=false, required=false, keyboardType }) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder || "Enter " + label.toLowerCase()}
      placeholderTextColor="#999" multiline={multiline} keyboardType={keyboardType}
      textAlignVertical={multiline ? "top" : "center"}
      style={[styles.input, multiline && styles.textArea]}
    />
  </View>;
}
function SelectField({ label, value, options, onChange }) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.optionWrap}>{options.map(o=><Pressable key={o} onPress={()=>onChange(o)} style={[styles.option, value===o && styles.optionActive]}><Text style={[styles.optionText,value===o&&styles.optionTextActive]}>{o}</Text></Pressable>)}</View>
  </View>;
}
function getItemImage(item) {
  // Representative item photos used by the prototype's sample records.
  // User-submitted reports can use a category-based image until photo upload is connected.
  const name = (item.name || "").toLowerCase();
  if (name.includes("id") || name.includes("card")) return "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=240&h=240&fit=crop";
  if (name.includes("headphone") || name.includes("earphone")) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=240&h=240&fit=crop";
  if (name.includes("key")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&h=240&fit=crop";
  if (name.includes("bottle") || name.includes("flask")) return "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=240&h=240&fit=crop";
  if (name.includes("calculator")) return "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=240&h=240&fit=crop";
  if (name.includes("macbook") || name.includes("laptop")) return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=240&h=240&fit=crop";
  if (name.includes("wallet")) return "https://images.unsplash.com/photo-1627123424574-724758594e93?w=240&h=240&fit=crop";
  if (item.category === "Electronics") return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=240&h=240&fit=crop";
  return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=240&h=240&fit=crop";
}

function ItemCard({ item, onPress }) {
  const tone = item.status==="Returned" ? "green" : item.status==="Claim Pending" || item.status==="Possible Match" ? "amber" : item.status==="Closed" ? "red" : "gray";
  return <Pressable onPress={onPress} style={({pressed})=>[styles.itemCard, styles.itemCardWithImage, pressed && {opacity:.8}]}>
    <Image source={{uri:getItemImage(item)}} style={styles.itemThumbnail} resizeMode="cover" />
    <View style={styles.itemCardContent}>
      <View style={styles.itemTop}><Text style={styles.itemName}>{item.name}</Text><Badge tone={tone}>{item.status}</Badge></View>
      <Text style={styles.itemMeta}>{item.type} · {item.id}</Text>
      <Text style={styles.itemMeta}>{item.category} · {item.location}</Text>
      <View style={styles.itemBottom}><Text style={styles.date}>{item.date}</Text><Text style={styles.link}>View Details →</Text></View>
    </View>
  </Pressable>;
}

export default function App() {
  const [screen, setScreen] = useState("Home");
  const [screenHistory, setScreenHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState("F-2084");
  const [query, setQuery] = useState("headphones");
  const [typeFilter, setTypeFilter] = useState("Found");
  const [categoryFilter, setCategoryFilter] = useState("Electronics");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [dateFilter, setDateFilter] = useState("Past 7 days");
  const [formType, setFormType] = useState("Lost");
  const [form, setForm] = useState({name:"",category:"Cards & IDs",description:"",location:"",date:"23 Oct 2026",time:"10:30 AM",details:""});
  const [claimReason, setClaimReason] = useState("");
  const [claimWhere, setClaimWhere] = useState("Main Library, Level 2 · 22 Oct, around 4:00 PM");
  const [notifications, setNotifications] = useState([
    {id:"n1", category:"Possible Matches", title:"A possible match for your MacBook", body:"L-1042 · A similar laptop was reported found in Engineering Hall. Compare it with F-2085.", time:"23 Oct · 10:42 AM", read:false},
    {id:"n2", category:"Review", title:"A claim needs your review", body:"F-2081 · Sam Patel has claimed your Navy Hydro Flask. Claim C-0309 is Pending.", time:"23 Oct · 10:20 AM", read:false},
    {id:"n3", category:"Claim Status", title:"Your return was confirmed", body:"F-2073 · Compact black umbrella is now Returned. Claim C-0298 is Completed.", time:"22 Oct · 3:30 PM", read:true}
  ]);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [profileName, setProfileName] = useState("Jordan Lee");
  const [profileEmail, setProfileEmail] = useState("jordan.lee@northfield.example");

  const selectedItem = items.find(i=>i.id===selectedId) || items[0];
  const filteredItems = useMemo(()=>items.filter(i=>{
    const q=query.trim().toLowerCase();
    const matchQuery=!q || (i.name+" "+i.description+" "+i.location).toLowerCase().includes(q);
    const matchType=typeFilter==="All" || i.type===typeFilter;
    const matchCategory=categoryFilter==="All categories" || i.category===categoryFilter;
    const matchLocation=locationFilter==="All locations" || i.location.includes(locationFilter);
    return matchQuery && matchType && matchCategory && matchLocation;
  }),[items,query,typeFilter,categoryFilter,locationFilter]);

  function navigate(target) { setScreenHistory(old=>[...old, screen]); setScreen(target); }
  function goBack() { const previous=screenHistory[screenHistory.length-1] || "Home"; setScreenHistory(old=>old.slice(0,-1)); setScreen(previous); }
  function openItem(item) { setSelectedId(item.id); navigate("Item Details"); }
  function openForm(type) { setEditingId(null); setFormType(type); setForm({name:"",category:type==="Lost"?"Cards & IDs":"Clothing",description:"",location:"",date:"23 Oct 2026",time:"10:30 AM",details:""}); navigate(type==="Lost"?"Report Lost Item":"Report Found Item"); }
  function updateForm(key,value) { setForm(old=>({...old,[key]:value})); }
  function submitReport() {
    if(!form.name.trim() || !form.location.trim() || !form.description.trim()) {
      Alert.alert("Required fields", "Please enter an item name, description, and location.");
      return;
    }
    if(editingId) {
      const updated={...items.find(i=>i.id===editingId),name:form.name.trim(),type:formType,category:form.category,location:form.location.trim(),date:form.date,status:items.find(i=>i.id===editingId)?.status || "Reported",description:form.description.trim()+(form.details.trim()?" "+form.details.trim():"")};
      setItems(old=>old.map(i=>i.id===editingId?updated:i)); setSelectedId(editingId); setEditingId(null); navigate("Item Details");
      Alert.alert("Report updated","Your report details have been updated in this demo.");
      return;
    }
    const id=(formType==="Lost"?"L-":"F-")+String(1050+items.length);
    const newItem={id,name:form.name.trim(),type:formType,category:form.category,location:form.location.trim(),date:form.date,status:"Reported",description:form.description.trim()+(form.details.trim()?" "+form.details.trim():"")};
    setItems(old=>[newItem,...old]); setSelectedId(id); navigate("Report Confirmation");
  }
  function submitClaim() {
    if(!claimReason.trim()) { Alert.alert("Required field","Please explain why you believe this item belongs to you."); return; }
    setClaimSubmitted(true);
    setNotifications(old=>[{id:"new"+Date.now(),category:"Review",title:"Your claim is pending review",body:"Your claim for "+selectedItem.name+" has been submitted.",time:"Just now",read:false},...old]);
    navigate("Claim Confirmation");
  }
  function markRead(id) { setNotifications(old=>old.map(n=>n.id===id?{...n,read:true}:n)); }
  function go(target) {
    if(target==="Report Lost Item") {openForm("Lost");return;}
    if(target==="Report Found Item") {openForm("Found");return;}
    navigate(target);
  }

  const unread = notifications.filter(n=>!n.read).length;

  function renderHome() {
    return <View>
      <Text style={styles.eyebrow}>NORTHFIELD UNIVERSITY / STUDENT WORKSPACE</Text>
      <Text style={styles.pageTitle}>Campus Lost & Found</Text>
      <Text style={styles.intro}>Lost something? Found something? Help belongings find their way back on campus.</Text>
      <View style={styles.heroActions}>
        <Button title="Search for an Item" onPress={()=>navigate("Search Items")}/>
        <View style={styles.homeReportActions}><Button title="Report Lost Item" secondary onPress={()=>openForm("Lost")}/><Button title="Report Found Item" accent onPress={()=>openForm("Found")}/></View>
      </View>
      <View style={styles.quickLinks}>
        <Pressable onPress={()=>openForm("Lost")} style={styles.quickLink}><Text style={styles.quickLinkTitle}>Lost an item?</Text><Text style={styles.link}>Report Lost Item →</Text></Pressable>
        <Pressable onPress={()=>openForm("Found")} style={styles.quickLink}><Text style={styles.quickLinkTitle}>Found an item?</Text><Text style={styles.link}>Report Found Item →</Text></Pressable>
      </View>
      <SectionTitle right="View all →" onRight={()=>{setTypeFilter("Lost");setQuery("");navigate("Search Items");}}>Recently Reported Lost Items</SectionTitle>
      {items.filter(i=>i.type==="Lost").slice(0,2).map(i=><ItemCard key={i.id} item={i} onPress={()=>openItem(i)}/>)}
      <SectionTitle right="View all →" onRight={()=>{setTypeFilter("Found");setQuery("");navigate("Search Items");}}>Recently Found Items</SectionTitle>
      {items.filter(i=>i.type==="Found").slice(0,2).map(i=><ItemCard key={i.id} item={i} onPress={()=>openItem(i)}/>)}
      <SectionTitle right="My Reports →" onRight={()=>navigate("My Reports")}>My Recent Reports</SectionTitle>
      {items.slice(0,2).map(i=><ItemCard key={i.id} item={i} onPress={()=>openItem(i)}/>)}
      <View style={styles.notice}><Text style={styles.noticeTitle}>Possible Matches & Pending Updates</Text><Text style={styles.body}>A possible match for your MacBook · L-1042</Text><Button title="View Notifications" secondary onPress={()=>navigate("Notifications")}/></View>
    </View>;
  }

  function renderSearch() {
    return <View>
      <Text style={styles.pageTitle}>Search Items</Text>
      <Text style={styles.intro}>Browse lost and found reports. A familiar detail could be the match you need.</Text>
      <Field label="Search by item name or description" value={query} onChangeText={setQuery} placeholder="Search here..." />
      <SelectField label="Lost or Found" value={typeFilter} options={["All","Lost","Found"]} onChange={setTypeFilter}/>
      <SelectField label="Item Category" value={categoryFilter} options={["All categories","Electronics","Cards & IDs","Keys","Clothing","Bottles & drinkware","Accessories"]} onChange={setCategoryFilter}/>
      <Field label="Location contains" value={locationFilter==="All locations"?"":locationFilter} onChangeText={v=>setLocationFilter(v||"All locations")} placeholder="All locations"/>
      <SelectField label="Date Reported" value={dateFilter} options={["Past 7 days","Past 30 days","Any time"]} onChange={setDateFilter}/>
      <View style={styles.rowActions}><Button title="Search" onPress={()=>{}}/><Button title="Clear all filters" secondary onPress={()=>{setQuery("");setTypeFilter("All");setCategoryFilter("All categories");setLocationFilter("All locations");setDateFilter("Any time");}}/></View>
      <SectionTitle>{filteredItems.length} results · Most recently reported first</SectionTitle>
      {filteredItems.length ? filteredItems.map(i=><ItemCard key={i.id} item={i} onPress={()=>openItem(i)}/>) : <View style={styles.empty}><Text style={styles.emptyTitle}>No items found yet</Text><Text style={styles.body}>Try a broader item name, another location, or a wider date range. You can also report your lost item so others know to look for it.</Text><Button title="Report Lost Item" onPress={()=>openForm("Lost")}/></View>}
      <Text style={styles.footnote}>Campus demo · No real records or actions. Contact details stay private.</Text>
    </View>;
  }

  function renderReportForm() {
    const isLost=formType==="Lost";
    return <View>
      <Text style={styles.pageTitle}>{editingId?"Edit":"Report"} {isLost?"Lost":"Found"} Item</Text>
      <Text style={styles.intro}>{isLost?"Tell us what you lost.":"Help an item get home."} Required fields are marked *.</Text>
      <View style={styles.notice}><Text style={styles.noticeTitle}>Keep identifying details private</Text><Text style={styles.body}>Do not post ID numbers, passwords, phone numbers, or email addresses. Describe the item, but keep unique identifying details private.</Text></View>
      <Field label="Item Name" value={form.name} onChangeText={v=>updateForm("name",v)} placeholder="e.g. Student ID card" required/>
      <SelectField label="Category" value={form.category} options={["Cards & IDs","Electronics","Keys","Clothing","Bottles & drinkware","Accessories","Other"]} onChange={v=>updateForm("category",v)}/>
      <Field label="Description" value={form.description} onChangeText={v=>updateForm("description",v)} placeholder="Describe the item. Keep unique identifying details private." multiline required/>
      <Field label={isLost?"Last Seen Location":"Location Found"} value={form.location} onChangeText={v=>updateForm("location",v)} placeholder="Choose a campus location" required/>
      <Field label={isLost?"Date Lost":"Date Found"} value={form.date} onChangeText={v=>updateForm("date",v)} placeholder="e.g. 23 Oct 2026" required/>
      <Field label="Approximate Time" value={form.time} onChangeText={v=>updateForm("time",v)} placeholder="Optional if unsure"/>
      <View style={styles.field}><Text style={styles.label}>Upload Photo (optional)</Text><Pressable style={styles.upload} onPress={()=>Alert.alert("Photo upload","Photo picker can be connected when the Expo Image Picker package is added.")}><Text style={styles.uploadTitle}>＋ Choose a photo</Text><Text style={styles.muted}>JPG or PNG, up to 10 MB · No file selected</Text></Pressable></View>
      <Field label="Additional Details (optional)" value={form.details} onChangeText={v=>updateForm("details",v)} placeholder="Anything else that may help?" multiline/>
      <Text style={styles.footnote}>Do not include your phone number, email, or sensitive ID numbers.</Text>
      <View style={styles.rowActions}><Button title={editingId?"Save Changes":"Submit Report"} onPress={submitReport}/><Button title="Cancel" secondary onPress={goBack}/></View>
    </View>;
  }

  function renderDetails() {
    const item=selectedItem;
    return <View>
      <Text style={styles.breadcrumb}>Search Items / {item.type.toLowerCase()} item · {item.id}</Text>
      <Text style={styles.pageTitle}>{item.name}</Text>
      <Text style={styles.intro}>Reported on {item.date} · Public item details</Text>
      <View style={styles.detailHero}><Text style={styles.detailIcon}>{item.category==="Electronics"?"▣":item.category==="Cards & IDs"?"▤":"◇"}</Text><Text style={styles.muted}>No photo provided</Text></View>
      <View style={styles.detailStatus}><Text style={styles.label}>{item.type} item</Text><Badge tone={item.status==="Returned"?"green":item.status==="Possible Match"||item.status==="Claim Pending"?"amber":"gray"}>{item.status}</Badge></View>
      <Text style={styles.sectionTitle}>Category</Text><Text style={styles.body}>{item.category}</Text>
      <Text style={styles.sectionTitle}>Description</Text><Text style={styles.body}>{item.description}</Text>
      <Text style={styles.sectionTitle}>{item.type==="Lost"?"Last Seen Location":"Location Found"}</Text><Text style={styles.body}>{item.location}</Text>
      <Text style={styles.sectionTitle}>Date & Approximate Time</Text><Text style={styles.body}>{item.date}</Text>
      {item.type==="Found" ? <View style={styles.notice}><Text style={styles.noticeTitle}>Is this yours?</Text><Text style={styles.body}>A matching name is only a starting point. Share a detail only the owner would know in your private claim. Finder contact details are not public.</Text><Button title="Claim This Item" onPress={()=>{setClaimSubmitted(false);setClaimReason("");navigate("Claim This Item");}}/></View> :
      <View style={styles.notice}><Text style={styles.noticeTitle}>Possible match, not yet verified</Text><Text style={styles.body}>A similar found report may match this item. The reports remain separate until ownership is verified.</Text><Button title="Report Possible Match" onPress={()=>navigate("Possible Match")}/></View>}
      <View style={styles.manageBox}>
        <Text style={styles.manageTitle}>Manage this report</Text>
        <Text style={styles.muted}>Update the report information or close it when it is no longer active.</Text>
        {item.status!=="Closed" && item.status!=="Returned" ? <View style={styles.rowActions}>
          <Button title="Edit Report" secondary onPress={()=>{setEditingId(item.id);setFormType(item.type);setForm({name:item.name,category:item.category,description:item.description,location:item.location,date:item.date,time:"",details:""});navigate(item.type==="Lost"?"Report Lost Item":"Report Found Item");}}/>
          <Button title="Close Report" danger onPress={()=>Alert.alert("Close report?","This report will be marked as closed.",[{text:"Cancel",style:"cancel"},{text:"Close report",style:"destructive",onPress:()=>{setItems(old=>old.map(i=>i.id===item.id?{...i,status:"Closed"}:i));Alert.alert("Report closed","The report has been marked as closed.");}}])}/>
        </View> : <Text style={styles.muted}>This report is closed or returned and can no longer be edited.</Text>}
      </View>
      <Button title="Back" secondary onPress={goBack}/>
      <Text style={styles.footnote}>Student contact details are never shown publicly. A possible match does not confirm ownership or close a report.</Text>
    </View>;
  }

  function renderMyReports() {
    return <View>
      <Text style={styles.pageTitle}>My Reports</Text>
      <Text style={styles.intro}>Manage your reports and follow their progress. Claim status is shown separately from report status.</Text>
      <SelectField label="Report type" value={typeFilter} options={["All","Lost","Found"]} onChange={setTypeFilter}/>
      <SectionTitle>{items.filter(i=>typeFilter==="All"||i.type===typeFilter).length} reports</SectionTitle>
      {items.filter(i=>typeFilter==="All"||i.type===typeFilter).map(i=><ItemCard key={i.id} item={i} onPress={()=>openItem(i)}/>)}
      <SectionTitle>My Claims</SectionTitle>
      <View style={styles.itemCard}><Text style={styles.itemName}>Black Sony headphones</Text><Text style={styles.itemMeta}>C-0312 · Found report F-2084 · 23 Oct 2026</Text><Badge tone="amber">{claimSubmitted?"Pending":"Pending"}</Badge><Button title="View Claim Status →" secondary onPress={()=>navigate("Claim Confirmation")}/></View>
      <Text style={styles.footnote}>Edit and Close are available for eligible reports. Returned and Closed reports are read-only.</Text>
    </View>;
  }

  function renderNotifications() {
    return <View>
      <Text style={styles.pageTitle}>Notifications</Text>
      <Text style={styles.intro}>Possible matches, claim requests, decisions, and report updates — all in one place.</Text>
      <View style={styles.rowBetween}><Text style={styles.body}>{unread} unread</Text><Pressable onPress={()=>setNotifications(old=>old.map(n=>({...n,read:true})))}><Text style={styles.link}>Mark all as read</Text></Pressable></View>
      <SelectField label="Notification category" value={notificationFilter} options={["All","Claim Status","Review","Possible Matches"]} onChange={setNotificationFilter}/>
      {notifications.filter(n=>notificationFilter==="All"||n.category===notificationFilter).map(n=><Pressable key={n.id} onPress={()=>markRead(n.id)} style={[styles.notification,!n.read&&styles.notificationUnread]}><View style={styles.itemTop}><View style={{flex:1}}><Badge tone={n.category==="Possible Matches"?"amber":n.category==="Review"?"red":"green"}>{n.category}</Badge><Text style={[styles.itemName,{marginTop:7}]}>{n.title}</Text></View>{!n.read&&<View style={styles.unreadDot}/>}</View><Text style={styles.body}>{n.body}</Text><Text style={styles.date}>{n.time}</Text></Pressable>)}
      {notifications.filter(n=>notificationFilter==="All"||n.category===notificationFilter).length===0&&<View style={styles.empty}><Text style={styles.emptyTitle}>No notifications in this category</Text><Text style={styles.body}>New updates will appear here when available.</Text></View>}
      <Text style={styles.footnote}>Sample notification history. No emails or push notifications are sent.</Text>
    </View>;
  }

  function renderClaim() {
    return <View>
      <Text style={styles.breadcrumb}>Found item · {selectedItem.id}</Text>
      <Text style={styles.pageTitle}>Claim This Item</Text>
      <Text style={styles.intro}>Help the finder verify that this item belongs to you.</Text>
      <View style={styles.itemCard}><Text style={styles.itemName}>{selectedItem.name}</Text><Text style={styles.itemMeta}>Found · {selectedItem.id} · {selectedItem.category}</Text><Text style={styles.itemMeta}>{selectedItem.location} · {selectedItem.date}</Text></View>
      <View style={styles.notice}><Text style={styles.noticeTitle}>Identifying details stay private</Text><Text style={styles.body}>Only you and the report owner can see this claim. Do not include passwords, phone numbers, or student ID numbers.</Text></View>
      <Field label="Why does this item belong to you?" value={claimReason} onChangeText={setClaimReason} placeholder="Include a detail not shown in the public report." multiline required/>
      <Field label="When and where did you last have it? (optional)" value={claimWhere} onChangeText={setClaimWhere} placeholder="Enter approximate time and location" multiline/>
      <Text style={styles.footnote}>The finder will review your identifying details. Wait for approval before arranging pickup.</Text>
      <View style={styles.rowActions}><Button title="Submit Claim" onPress={submitClaim}/><Button title="Cancel" secondary onPress={()=>navigate("Item Details")}/></View>
    </View>;
  }

  function renderClaimConfirmation() {
    return <View>
      <Text style={styles.pageTitle}>{claimSubmitted?"Your claim is awaiting review":"Claim status"}</Text>
      <Text style={styles.intro}>{claimSubmitted?"Claim submitted · Just now":"Sample claim status"}</Text>
      <View style={styles.notice}><Text style={styles.noticeTitle}>Claim submitted</Text><Text style={styles.body}>Your claim for {selectedItem.name} is Pending. The finder will review your identifying details. Check Notifications for an Approved or Rejected decision.</Text></View>
      <View style={styles.itemCard}><Text style={styles.label}>Item being claimed</Text><Text style={styles.itemName}>{selectedItem.name}</Text><Text style={styles.itemMeta}>Found · {selectedItem.id} · {selectedItem.category}</Text><Badge tone="amber">Pending</Badge></View>
      <Button title="View Item Report" onPress={()=>navigate("Item Details")}/>
      <Button title="Back to My Reports" secondary onPress={()=>navigate("My Reports")}/>
      <Text style={styles.footnote}>This is a local demo. No claim has been sent to a real finder.</Text>
    </View>;
  }

  function renderPossibleMatch() {
    const lost=items.find(i=>i.type==="Lost")||items[0];
    const found=items.find(i=>i.type==="Found"&&i.category===lost.category)||items.find(i=>i.type==="Found")||items[0];
    return <View>
      <Text style={styles.pageTitle}>Report Possible Match</Text>
      <Text style={styles.intro}>Link a found report that may match your lost item. A match is a suggestion, not proof of ownership.</Text>
      <View style={styles.itemCard}><Text style={styles.label}>Lost item</Text><Text style={styles.itemName}>{lost.name}</Text><Text style={styles.itemMeta}>{lost.id} · {lost.location}</Text></View>
      <View style={styles.itemCard}><Text style={styles.label}>Found report</Text><Text style={styles.itemName}>{found.name}</Text><Text style={styles.itemMeta}>{found.id} · {found.location}</Text></View>
      <Field label="Why might these items match?" value={claimReason} onChangeText={setClaimReason} placeholder="Describe the similarities." multiline required/>
      <Text style={styles.footnote}>Keep verification details private. Do not include serial numbers, passwords, or personal contact information.</Text>
      <Button title="Submit Possible Match" onPress={()=>{if(!claimReason.trim()){Alert.alert("Required field","Please describe why the items might match.");return;}setNotifications(old=>[{id:"match"+Date.now(),category:"Possible Matches",title:"Possible match submitted",body:`Your possible match for ${lost.name} has been recorded in this demo.`,time:"Just now",read:false},...old]);navigate("Notifications");}}/>
      <Button title="Cancel" secondary onPress={()=>navigate("Item Details")}/>
    </View>;
  }

  function renderProfile() {
    return <View>
      <Text style={styles.pageTitle}>Profile</Text>
      <Text style={styles.intro}>Your student profile is private. Your email is not shown on public item reports.</Text>
      <View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>{profileName.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase()}</Text></View><Text style={styles.itemName}>{profileName}</Text><Text style={styles.body}>Northfield University · Sample student</Text></View>
      <Field label="Name" value={profileName} onChangeText={setProfileName} required/>
      <Field label="Email" value={profileEmail} onChangeText={setProfileEmail} keyboardType="email-address" required/>
      <Text style={styles.footnote}>A demo account, not a university login. Profile edits are only stored while this app is running.</Text>
      <Button title="Save Changes" onPress={()=>Alert.alert("Profile updated","Your demo profile has been updated.")}/>
      <Button title="Sign Out" secondary onPress={()=>Alert.alert("Demo account","Sign-out is simulated in this prototype.")}/>
    </View>;
  }

  function renderContent() {
    switch(screen) {
      case "Home": return renderHome();
      case "Search Items": return renderSearch();
      case "Report Lost Item": return renderReportForm();
      case "Report Found Item": return renderReportForm();
      case "Report Choice": return <View><Text style={styles.pageTitle}>Report an Item</Text><Text style={styles.intro}>Choose the report type.</Text><Button title="Report Lost Item" onPress={()=>openForm("Lost")}/><Button title="Report Found Item" secondary onPress={()=>openForm("Found")}/></View>;
      case "Item Details": return renderDetails();
      case "My Reports": return renderMyReports();
      case "Notifications": return renderNotifications();
      case "Profile": return renderProfile();
      case "Claim This Item": return renderClaim();
      case "Claim Confirmation": return renderClaimConfirmation();
      case "Possible Match": return renderPossibleMatch();
      case "Report Confirmation": return <View><Text style={styles.pageTitle}>Your sample report is ready</Text><Text style={styles.intro}>A local demo report was added. No real report was published.</Text><View style={styles.notice}><Text style={styles.noticeTitle}>Report submitted successfully</Text><Text style={styles.body}>Reference {selectedItem.id} · {selectedItem.date}. Your report has been added with status Reported.</Text></View><Text style={styles.sectionTitle}>Your submitted report</Text><ItemCard item={selectedItem} onPress={()=>navigate("Item Details")}/><Text style={styles.muted}>Select the report above to view its full details.</Text><Button title="Go to My Reports" secondary onPress={()=>navigate("My Reports")}/></View>;
      default: return renderHome();
    }
  }

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
    <View style={styles.topbar}>
      <Pressable onPress={()=>navigate("Home")} style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View><View><Text style={styles.brandTitle}>Campus</Text><Text style={styles.brandSubtitle}>Lost & Found</Text></View></Pressable>
      <View style={styles.userArea}><View style={styles.userInitials}><Text style={styles.userInitialsText}>JL</Text></View><Text style={styles.userName}>Jordan Lee</Text></View>
    </View>
    <View style={styles.demoBanner}><Text style={styles.demoBannerText}>Demo / sample data — not university records</Text></View>
    <View style={styles.appBody}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll} contentContainerStyle={styles.navContent}>
        {nav.map(([label,icon])=><Pressable key={label} onPress={()=>go(label)} style={[styles.navItem,screen===label&&styles.navItemActive]}><Text style={[styles.navIcon,screen===label&&styles.navTextActive]}>{icon}</Text><Text style={[styles.navText,screen===label&&styles.navTextActive]}>{label}{label==="Notifications"&&unread>0?" "+unread:""}</Text></Pressable>)}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={styles.contentWrap}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {screen!=="Home" && <Pressable onPress={goBack} style={styles.backControl}><Text style={styles.backControlText}>← Back</Text></Pressable>}
          {renderContent()}
          <View style={styles.footer}><Text style={styles.footerTitle}>Northfield University</Text><Text style={styles.muted}>Student community demo</Text><Text style={styles.footnote}>Static sample data for a coursework prototype. Nothing is sent to university systems.</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:COLORS.white},
  topbar:{height:64,paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:COLORS.line,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  brand:{flexDirection:"row",alignItems:"center",gap:10},
  brandMark:{width:34,height:34,borderWidth:1,borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft,alignItems:"center",justifyContent:"center"},
  brandMarkText:{fontSize:18,fontWeight:"700",color:COLORS.accent},
  brandTitle:{fontSize:15,fontWeight:"700",color:COLORS.ink},
  brandSubtitle:{fontSize:12,color:COLORS.muted,marginTop:1},
  userArea:{flexDirection:"row",alignItems:"center",gap:8},
  userInitials:{width:30,height:30,borderRadius:15,backgroundColor:COLORS.soft,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:COLORS.line},
  userInitialsText:{fontSize:11,fontWeight:"700",color:COLORS.ink},
  userName:{fontSize:12,color:COLORS.ink},
  demoBanner:{backgroundColor:"#FAFAFA",paddingHorizontal:18,paddingVertical:8,borderBottomWidth:1,borderBottomColor:COLORS.line},
  demoBannerText:{fontSize:11,color:COLORS.muted},
  appBody:{flex:1},
  navScroll:{maxHeight:54,borderBottomWidth:1,borderBottomColor:COLORS.line,flexGrow:0},
  navContent:{paddingHorizontal:8,alignItems:"stretch"},
  navItem:{paddingHorizontal:11,minWidth:92,alignItems:"center",justifyContent:"center",borderBottomWidth:2,borderBottomColor:"transparent",flexDirection:"row",gap:6},
  navItemActive:{borderBottomColor:COLORS.accent,backgroundColor:COLORS.accentSoft},
  navIcon:{fontSize:16,color:COLORS.muted},
  navText:{fontSize:11,color:COLORS.muted},
  navTextActive:{color:COLORS.accent,fontWeight:"700"},
  contentWrap:{flex:1},
  content:{padding:18,paddingBottom:36,maxWidth:850,width:"100%",alignSelf:"center"},
  eyebrow:{fontSize:10,fontWeight:"700",letterSpacing:1,color:COLORS.muted,marginBottom:9},
  pageTitle:{fontSize:27,lineHeight:33,fontWeight:"700",color:COLORS.ink,marginBottom:8},
  intro:{fontSize:14,lineHeight:21,color:COLORS.muted,marginBottom:20},
  heroActions:{gap:9,marginBottom:14},
  quickLinks:{flexDirection:"row",gap:10,marginBottom:24},
  quickLink:{flex:1,borderWidth:1,borderColor:COLORS.line,padding:13,gap:7},
  quickLinkTitle:{fontSize:13,fontWeight:"600",color:COLORS.ink},
  button:{backgroundColor:COLORS.ink,minHeight:44,paddingHorizontal:15,paddingVertical:12,alignItems:"center",justifyContent:"center",marginBottom:9},
  buttonSecondary:{backgroundColor:COLORS.white,borderWidth:1,borderColor:"#BEBEBE"},
  buttonAccent:{backgroundColor:COLORS.accent},
  buttonDanger:{backgroundColor:"#8F2525"},
  homeReportActions:{gap:8,marginBottom:14},
  backControl:{alignSelf:"flex-start",paddingVertical:8,paddingHorizontal:2,marginBottom:8},
  backControlText:{fontSize:13,fontWeight:"700",color:COLORS.accent},
  manageBox:{borderWidth:1,borderColor:"#E8C7C7",backgroundColor:COLORS.accentSoft,padding:14,marginTop:18,marginBottom:12},
  manageTitle:{fontSize:14,fontWeight:"700",color:COLORS.ink,marginBottom:5},
  buttonText:{color:COLORS.white,fontSize:13,fontWeight:"600"},
  buttonTextSecondary:{color:COLORS.ink},
  sectionTitleRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:16,marginBottom:10},
  sectionTitle:{fontSize:16,fontWeight:"700",color:COLORS.ink,marginTop:14,marginBottom:9},
  link:{fontSize:12,fontWeight:"600",color:COLORS.accent,textDecorationLine:"underline"},
  itemCard:{borderWidth:1,borderColor:COLORS.line,padding:13,marginBottom:10,backgroundColor:COLORS.white},
  itemCardWithImage:{flexDirection:"row",alignItems:"center",gap:12},
  itemThumbnail:{width:76,height:76,backgroundColor:COLORS.soft,borderRadius:4},
  itemCardContent:{flex:1,minWidth:0},
  itemTop:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:8},
  itemName:{fontSize:14,fontWeight:"700",color:COLORS.ink,flex:1,marginBottom:6},
  itemMeta:{fontSize:12,lineHeight:18,color:COLORS.muted,marginBottom:2},
  itemBottom:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:9},
  date:{fontSize:11,color:COLORS.faint},
  badge:{alignSelf:"flex-start",borderWidth:1,borderColor:"#D9D9D9",backgroundColor:"#F7F7F7",paddingHorizontal:7,paddingVertical:4},
  badgeGreen:{borderColor:"#C7E2D0",backgroundColor:COLORS.greenBg},
  badgeAmber:{borderColor:"#F0D9A8",backgroundColor:COLORS.warningBg},
  badgeRed:{borderColor:"#EBCACA",backgroundColor:COLORS.redBg},
  badgeText:{fontSize:10,fontWeight:"600",color:COLORS.ink},
  field:{marginBottom:15},
  label:{fontSize:12,fontWeight:"600",color:COLORS.ink,marginBottom:7},
  input:{minHeight:44,borderWidth:1,borderColor:"#D5D5D5",paddingHorizontal:12,paddingVertical:10,fontSize:13,color:COLORS.ink,backgroundColor:COLORS.white},
  textArea:{minHeight:94,paddingTop:11},
  optionWrap:{flexDirection:"row",flexWrap:"wrap",gap:7},
  option:{borderWidth:1,borderColor:COLORS.line,paddingHorizontal:10,paddingVertical:8,backgroundColor:COLORS.white},
  optionActive:{borderColor:COLORS.accent,backgroundColor:COLORS.accentSoft},
  optionText:{fontSize:11,color:COLORS.muted},
  optionTextActive:{fontWeight:"700",color:COLORS.accent},
  rowActions:{flexDirection:"row",gap:8,alignItems:"stretch",marginTop:7},
  notice:{borderWidth:1,borderColor:COLORS.line,padding:14,marginVertical:12,backgroundColor:"#FAFAFA"},
  noticeTitle:{fontSize:13,fontWeight:"700",color:COLORS.ink,marginBottom:6},
  body:{fontSize:13,lineHeight:20,color:COLORS.muted,marginBottom:10},
  muted:{fontSize:11,color:COLORS.muted},
  upload:{borderWidth:1,borderStyle:"dashed",borderColor:"#BEBEBE",padding:15,gap:8},
  uploadTitle:{fontSize:13,fontWeight:"600",color:COLORS.ink},
  footnote:{fontSize:11,lineHeight:17,color:COLORS.faint,marginTop:12,marginBottom:14},
  empty:{borderWidth:1,borderColor:COLORS.line,padding:18,alignItems:"flex-start",marginTop:8},
  emptyTitle:{fontSize:15,fontWeight:"700",color:COLORS.ink,marginBottom:8},
  detailHero:{height:130,backgroundColor:COLORS.soft,borderWidth:1,borderColor:COLORS.line,alignItems:"center",justifyContent:"center",marginBottom:15,gap:8},
  detailIcon:{fontSize:30,color:COLORS.muted},
  detailStatus:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:10},
  breadcrumb:{fontSize:11,color:COLORS.muted,marginBottom:12},
  rowBetween:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12},
  notification:{borderWidth:1,borderColor:COLORS.line,padding:13,marginBottom:9},
  notificationUnread:{backgroundColor:"#FAFAFA",borderColor:"#BDBDBD"},
  unreadDot:{width:7,height:7,borderRadius:4,backgroundColor:COLORS.accent,marginTop:4},
  profileCard:{borderWidth:1,borderColor:COLORS.line,padding:18,alignItems:"center",marginBottom:18},
  avatar:{width:54,height:54,borderWidth:1,borderColor:COLORS.line,backgroundColor:COLORS.soft,alignItems:"center",justifyContent:"center",marginBottom:10},
  avatarText:{fontSize:17,fontWeight:"700",color:COLORS.ink},
  footer:{borderTopWidth:1,borderTopColor:COLORS.line,marginTop:28,paddingTop:16},
  footerTitle:{fontSize:13,fontWeight:"700",color:COLORS.ink,marginBottom:5}
});
