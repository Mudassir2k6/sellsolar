import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BatteryCharging,
  Bell,
  Boxes,
  Calendar,
  ChartColumn,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  CircleCheckBig,
  CirclePlus,
  CircleX,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Facebook,
  FilePen,
  FileText,
  Headphones,
  Heart,
  Image,
  Instagram,
  Layers,
  LayoutDashboard,
  Linkedin,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  Package,
  PackageOpen,
  Phone,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Sun,
  Tag,
  TrendingUp,
  Twitter,
  User,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { BRANDS, CATEGORIES, CITIES, formatPrice } from './lib/constants';

function Xy({
  onNavigate:t,currentPage:e
}){
  var w;
  const[r,n]=useState(!1),[s,a]=useState(!1),[l,o]=useState(!1),{
    user:c,profile:u,signOut:d
  }=useAuth();
  useEffect(()=>{
    const j=()=>n(window.scrollY>20);
    return window.addEventListener("scroll",j),()=>window.removeEventListener("scroll",j)
  },[]);
  const h=j=>{
    t(j),a(!1),o(!1)
  },p=async()=>{
    await d(),t("home"),o(!1)
  },y=[{
    label:"Buy Solar",page:"home",href:"#listings"
  },{
    label:"Dealers",page:"dealers"
  },{
    label:"How It Works",page:"home",href:"#how-it-works"
  }];
  return jsxs("header",{
    className:`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${r?"bg-white/95 backdrop-blur-md shadow-md":"bg-white/80 backdrop-blur-sm"}`,children:[jsx("div",{
      className:"container-page",children:jsxs("div",{
        className:"flex h-16 items-center justify-between lg:h-20",children:[jsxs("button",{
          onClick:()=>h("home"),className:"flex items-center gap-2 shrink-0",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsx("nav",{
          className:"hidden items-center gap-1 lg:flex",children:y.map(j=>jsx("button",{
            onClick:()=>h(j.page),className:"rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900",children:j.label
          },j.label))
        }),jsxs("div",{
          className:"flex items-center gap-3",children:[c?jsxs(Fragment,{
            children:[jsxs("button",{
              onClick:()=>h("post-ad"),className:"btn-primary hidden text-sm sm:inline-flex",children:[jsx(CirclePlus,{
                className:"h-4 w-4"
              }),"Post an Ad"]
            }),jsxs("div",{
              className:"relative",children:[jsxs("button",{
                onClick:()=>o(!l),className:"flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50",children:[jsx("div",{
                  className:"flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white",children:((u==null?void 0:u.full_name)||c.email||"U").charAt(0).toUpperCase()
                }),jsx("span",{
                  className:"hidden sm:inline",children:((w=u==null?void 0:u.full_name)==null?void 0:w.split(" ")[0])||"User"
                }),jsx(ChevronDown,{
                  className:"h-4 w-4 text-gray-400"
                })]
              }),l&&jsxs("div",{
                className:"absolute right-0 mt-2 w-56 animate-slide-down rounded-xl border border-gray-100 bg-white py-2 shadow-xl",children:[jsxs("div",{
                  className:"border-b border-gray-100 px-4 py-2",children:[jsx("p",{
                    className:"text-sm font-bold text-gray-900",children:(u==null?void 0:u.full_name)||"User"
                  }),jsx("p",{
                    className:"truncate text-xs text-gray-500",children:c.email
                  }),(u==null?void 0:u.account_type)==="dealer"&&jsx("span",{
                    className:"mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:u.is_verified_dealer?"Verified Dealer":"Dealer"
                  })]
                }),jsxs("button",{
                  onClick:()=>h("dashboard"),className:"flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50",children:[jsx(LayoutDashboard,{
                    className:"h-4 w-4 text-gray-400"
                  }),"EyeOff Dashboard"]
                }),jsxs("button",{
                  onClick:()=>h("post-ad"),className:"flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50",children:[jsx(CirclePlus,{
                    className:"h-4 w-4 text-gray-400"
                  }),"Post an Ad"]
                }),jsxs("button",{
                  onClick:()=>h("dealers"),className:"flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50",children:[jsx(Store,{
                    className:"h-4 w-4 text-gray-400"
                  }),"View Dealers"]
                }),(u==null?void 0:u.is_admin)&&jsxs("button",{
                  onClick:()=>h("admin-dashboard"),className:"flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50",children:[jsx(ShieldCheck,{
                    className:"h-4 w-4"
                  }),"Admin Dashboard"]
                }),jsxs("button",{
                  onClick:p,className:"flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50",children:[jsx(LogOut,{
                    className:"h-4 w-4"
                  }),"Sign Out"]
                })]
              })]
            })]
          }):jsxs(Fragment,{
            children:[jsx("button",{
              onClick:()=>h("login"),className:"hidden text-sm font-semibold text-gray-600 hover:text-gray-900 sm:inline-flex",children:"Login"
            }),jsx("button",{
              onClick:()=>h("login"),className:"btn-primary hidden text-sm sm:inline-flex",children:"Post an Ad"
            })]
          }),jsx("button",{
            onClick:()=>a(!s),className:"rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden","aria-label":"Toggle menu",children:s?jsx(X,{
              className:"h-6 w-6"
            }):jsx(Menu,{
              className:"h-6 w-6"
            })
          })]
        })]
      })
    }),s&&jsx("div",{
      className:"animate-slide-down border-t border-gray-100 bg-white lg:hidden",children:jsxs("nav",{
        className:"container-page flex flex-col gap-1 py-4",children:[y.map(j=>jsxs("button",{
          onClick:()=>h(j.page),className:"flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50",children:[j.label,jsx(ChevronDown,{
            className:"h-4 w-4 -rotate-90 text-gray-400"
          })]
        },j.label)),c?jsxs(Fragment,{
          children:[jsxs("button",{
            onClick:()=>h("dashboard"),className:"flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50",children:[jsx(LayoutDashboard,{
              className:"h-4 w-4"
            }),"EyeOff Dashboard"]
          }),jsxs("button",{
            onClick:()=>h("post-ad"),className:"flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50",children:[jsx(CirclePlus,{
              className:"h-4 w-4"
            }),"Post an Ad"]
          }),(u==null?void 0:u.is_admin)&&jsxs("button",{
            onClick:()=>h("admin-dashboard"),className:"flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-error-600 hover:bg-error-50",children:[jsx(ShieldCheck,{
              className:"h-4 w-4"
            }),"Admin Dashboard"]
          }),jsxs("button",{
            onClick:p,className:"flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-error-600 hover:bg-error-50",children:[jsx(LogOut,{
              className:"h-4 w-4"
            }),"Sign Out"]
          })]
        }):jsx("button",{
          onClick:()=>h("login"),className:"btn-primary mt-2 w-full",children:"Login / Sign Up"
        })]
      })
    })]
  })
}const Zy=[{
  value:"",label:"All",icon:Search
},{
  value:"panel",label:"Panels",icon:Sun
},{
  value:"inverter",label:"Inverters",icon:Zap
},{
  value:"battery",label:"Batteries",icon:BatteryCharging
},{
  value:"complete_system",label:"Systems",icon:Boxes
}],ex=["","Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Gujranwala","Peshawar"],tx=["","Longi","Canadian Solar","Jinko","Trina","Inverex","Tesla","Homage","Phoenix","Osaka","AGS"],rx=[{
  value:"",label:"Any Condition"
},{
  value:"new",label:"New"
},{
  value:"used",label:"Used"
}];
function nx({
  filters:t,onFilterChange:e,onSearch:r,onReset:n
}){
  return jsxs("section",{
    className:"relative overflow-hidden BadgeCheck-16 lg:BadgeCheck-20",children:[jsxs("div",{
      className:"absolute inset-0 -z-10",children:[jsx("div",{
        className:"absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"
      }),jsx("div",{
        className:"absolute inset-0 bg-grid opacity-40"
      }),jsx("div",{
        className:"absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-300/30 blur-3xl"
      }),jsx("div",{
        className:"absolute -left-32 top-64 h-96 w-96 rounded-full bg-secondary-300/20 blur-3xl"
      })]
    }),jsxs("div",{
      className:"container-page py-12 lg:py-20",children:[jsxs("div",{
        className:"mx-auto max-w-3xl text-center",children:[jsxs("div",{
          className:"mb-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700",children:[jsx(TrendingUp,{
            className:"h-4 w-4"
          }),"Pakistan's #1 Solar Marketplace"]
        }),jsxs("h1",{
          className:"text-balance text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl",children:["Buy & Sell Solar Panels,",jsx("br",{
            
          }),jsx("span",{
            className:"bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent",children:"Inverters & Systems"
          })]
        }),jsx("p",{
          className:"mx-auto mt-5 max-w-2xl text-lg text-gray-600",children:"Find the best deals on new and used solar equipment from trusted sellers across Pakistan. Compare prices, brands, and specifications in one place."
        }),jsxs("div",{
          className:"mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500",children:[jsxs("span",{
            className:"flex items-center gap-1.5",children:[jsx(ShieldCheck,{
              className:"h-4 w-4 text-secondary-500"
            }),"Verified Sellers"]
          }),jsxs("span",{
            className:"flex items-center gap-1.5",children:[jsx(Clock,{
              className:"h-4 w-4 text-primary-500"
            }),"Updated Daily"]
          }),jsxs("span",{
            className:"flex items-center gap-1.5",children:[jsx(TrendingUp,{
              className:"h-4 w-4 text-accent-500"
            }),"500+ Listings"]
          })]
        })]
      }),jsx("div",{
        className:"mx-auto mt-10 max-w-5xl",children:jsxs("div",{
          className:"card overflow-hidden p-0 shadow-xl",children:[jsx("div",{
            className:"flex gap-1 overflow-x-auto border-b border-gray-100 p-2 scrollbar-hide",children:Zy.map(s=>{
              const a=s.icon,l=t.category===s.value;
              return jsxs("button",{
                onClick:()=>e("category",s.value),className:`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${l?"bg-primary-500 text-white shadow-md shadow-primary-500/30":"text-gray-600 hover:bg-gray-100"}`,children:[jsx(a,{
                  className:"h-4 w-4"
                }),s.label]
              },s.value||"all")
            })
          }),jsxs("div",{
            className:"p-4 sm:p-6",children:[jsxs("div",{
              className:"relative mb-4",children:[jsx(Search,{
                className:"absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              }),jsx("input",{
                type:"text",placeholder:"Search by title, brand, or keyword...",value:t.query,onChange:s=>e("query",s.target.value),onKeyDown:s=>s.key==="Enter"&&r(),className:"w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-xs font-semibold text-gray-500",children:"Brand"
                }),jsx("select",{
                  value:t.brand,onChange:s=>e("brand",s.target.value),className:"select-field text-xs sm:text-sm",children:tx.map(s=>jsx("option",{
                    value:s,children:s||"All Brands"
                  },s))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-xs font-semibold text-gray-500",children:"Condition"
                }),jsx("select",{
                  value:t.condition,onChange:s=>e("condition",s.target.value),className:"select-field text-xs sm:text-sm",children:rx.map(s=>jsx("option",{
                    value:s.value,children:s.label
                  },s.value))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-xs font-semibold text-gray-500",children:"City"
                }),jsx("select",{
                  value:t.city,onChange:s=>e("city",s.target.value),className:"select-field text-xs sm:text-sm",children:ex.map(s=>jsx("option",{
                    value:s,children:s||"All Cities"
                  },s))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-xs font-semibold text-gray-500",children:"Min Price"
                }),jsx("input",{
                  type:"number",placeholder:"0",value:t.minPrice,onChange:s=>e("minPrice",s.target.value),className:"input-field text-xs sm:text-sm"
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-xs font-semibold text-gray-500",children:"Max Price"
                }),jsx("input",{
                  type:"number",placeholder:"Any",value:t.maxPrice,onChange:s=>e("maxPrice",s.target.value),className:"input-field text-xs sm:text-sm"
                })]
              })]
            }),jsxs("div",{
              className:"mt-4 flex flex-col gap-3 sm:flex-row",children:[jsxs("button",{
                onClick:r,className:"btn-primary flex-1",children:[jsx(Search,{
                  className:"h-5 w-5"
                }),"Search Solar Listings"]
              }),jsx("button",{
                onClick:n,className:"btn-ghost sm:w-auto",children:"Reset Filters"
              })]
            })]
          })]
        })
      }),jsx("div",{
        className:"mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4",children:[{
          value:"500+",label:"Active Listings"
        },{
          value:"120+",label:"Verified Sellers"
        },{
          value:"15+",label:"Cities Covered"
        },{
          value:"10K+",label:"Monthly Visitors"
        }].map(s=>jsxs("div",{
          className:"card p-4 text-center",children:[jsx("div",{
            className:"text-2xl font-extrabold text-gray-900",children:s.value
          }),jsx("div",{
            className:"mt-1 text-xs font-medium text-gray-500",children:s.label
          })]
        },s.label))
      })]
    })]
  })
}const sx=[{
  value:"panel",icon:Sun,desc:"Monocrystalline & polycrystalline panels",gradient:"from-primary-400 to-primary-600"
},{
  value:"inverter",icon:Zap,desc:"Hybrid, off-grid & grid-tie inverters",gradient:"from-accent-400 to-accent-600"
},{
  value:"battery",icon:BatteryCharging,desc:"Deep cycle & tubular solar batteries",gradient:"from-secondary-400 to-secondary-600"
},{
  value:"complete_system",icon:Boxes,desc:"Full solar kits with installation",gradient:"from-warning-400 to-warning-600"
}];
function ix({
  onSelectCategory:t
}){
  return jsx("section",{
    id:"categories",className:"py-16 lg:py-20",children:jsxs("div",{
      className:"container-page",children:[jsxs("div",{
        className:"mx-auto mb-10 max-w-2xl text-center",children:[jsx("h2",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Browse by Category"
        }),jsx("p",{
          className:"mt-2 text-gray-500",children:"Find exactly what you need across our solar equipment categories"
        })]
      }),jsx("div",{
        className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",children:sx.map(e=>{
          const r=e.icon;
          return jsxs("button",{
            onClick:()=>t(e.value),className:"card group p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",children:[jsx("div",{
              className:`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${e.gradient} shadow-lg transition-transform group-hover:scale-110`,children:jsx(r,{
                className:"h-7 w-7 text-white",strokeWidth:2
              })
            }),jsx("h3",{
              className:"text-lg font-bold text-gray-900",children:CATEGORIES[e.value]
            }),jsx("p",{
              className:"mt-1 text-sm text-gray-500",children:e.desc
            }),jsxs("div",{
              className:"mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600 transition-all group-hover:gap-2",children:["Browse now",jsx(ArrowRight,{
                className:"h-4 w-4"
              })]
            })]
          },e.value)
        })
      })]
    })
  })
}function ax({
  listing:t,onClick:e
}){
  const r=t.condition==="used";
  return jsxs("div",{
    className:"card group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",onClick:e,children:[jsxs("div",{
      className:"relative aspect-[4/3] overflow-hidden bg-gray-100",children:[t.image_url?jsx("img",{
        src:t.image_url,alt:t.title,loading:"lazy",className:"h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      }):jsx("div",{
        className:"flex h-full items-center justify-center bg-gray-100",children:jsx(Zap,{
          className:"h-12 w-12 text-gray-300"
        })
      }),jsxs("div",{
        className:"absolute left-3 top-3 flex gap-2",children:[jsx("span",{
          className:`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${r?"bg-warning-500 text-white":"bg-secondary-500 text-white"}`,children:r?"Used":"New"
        }),t.featured&&jsxs("span",{
          className:"flex items-center gap-1 rounded-full bg-primary-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm",children:[jsx(Tag,{
            className:"h-3 w-3"
          }),"Featured"]
        })]
      }),jsxs("div",{
        className:"absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm",children:[jsx(Eye,{
          className:"h-3 w-3"
        }),t.views]
      })]
    }),jsxs("div",{
      className:"p-4",children:[jsxs("div",{
        className:"mb-1 flex items-center gap-2 text-xs font-semibold text-primary-600",children:[jsx("span",{
          children:CATEGORIES[t.category]
        }),t.capacity_kw&&jsx("span",{
          className:"text-gray-400",children:"•"
        }),t.capacity_kw&&jsxs("span",{
          className:"text-gray-500",children:[t.capacity_kw,"kW"]
        })]
      }),jsx("h3",{
        className:"line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-600",children:t.title
      }),jsxs("div",{
        className:"mt-2 flex items-center gap-1.5 text-xs text-gray-500",children:[jsx(MapPin,{
          className:"h-3.5 w-3.5"
        }),t.city,jsx("span",{
          className:"text-gray-300",children:"•"
        }),jsx("span",{
          className:"font-medium text-gray-600",children:t.brand
        })]
      }),jsx("div",{
        className:"mt-3 flex items-end justify-between",children:jsxs("div",{
          children:[jsx("div",{
            className:"text-lg font-extrabold text-gray-900",children:formatPrice(t.price)
          }),t.warranty_years?jsxs("div",{
            className:"flex items-center gap-1 text-xs text-secondary-600",children:[jsx(ShieldCheck,{
              className:"h-3 w-3"
            }),t.warranty_years,"yr warranty"]
          }):jsx("div",{
            className:"text-xs text-gray-400",children:"No warranty"
          })]
        })
      })]
    })]
  })
}function lx({
  listings:t,loading:e,error:r,totalCount:n,onSelectListing:s
}){
  return jsx("section",{
    id:"listings",className:"bg-gray-50 py-16 lg:py-20",children:jsxs("div",{
      className:"container-page",children:[jsx("div",{
        className:"mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",children:jsxs("div",{
          children:[jsxs("div",{
            className:"mb-2 flex items-center gap-2 text-sm font-semibold text-primary-600",children:[jsx(SlidersHorizontal,{
              className:"h-4 w-4"
            }),"Browse Listings"]
          }),jsx("h2",{
            className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Available Solar Equipment"
          }),jsx("p",{
            className:"mt-1 text-sm text-gray-500",children:e?"Loading...":`${n} ${n===1?"listing":"listings"} found`
          })]
        })
      }),e?jsxs("div",{
        className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
          className:"h-10 w-10 animate-spin text-primary-500"
        }),jsx("p",{
          className:"mt-4 text-sm text-gray-500",children:"Loading listings..."
        })]
      }):r?jsxs("div",{
        className:"flex flex-col items-center justify-center rounded-2xl bg-error-50 py-20 text-center",children:[jsx("p",{
          className:"text-base font-semibold text-error-700",children:r
        }),jsx("p",{
          className:"mt-2 text-sm text-error-500",children:"Please try again later."
        })]
      }):t.length===0?jsxs("div",{
        className:"flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center ring-1 ring-gray-200",children:[jsx(PackageOpen,{
          className:"h-16 w-16 text-gray-300"
        }),jsx("p",{
          className:"mt-4 text-lg font-semibold text-gray-700",children:"No listings found"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Try adjusting your search filters to see more results."
        })]
      }):jsx("div",{
        className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:t.map(a=>jsx(ax,{
          listing:a,onClick:()=>s(a.id)
        },a.id))
      })]
    })
  })
}const ox=[{
  icon:ShieldCheck,title:"Verified Sellers",desc:"Every seller is identity-verified so you can buy with confidence and avoid scams.",color:"text-secondary-500",bg:"bg-secondary-50"
},{
  icon:TrendingUp,title:"Best Market Prices",desc:"Compare prices across brands and cities to get the best deal on solar equipment.",color:"text-primary-500",bg:"bg-primary-50"
},{
  icon:Headphones,title:"Expert Support",desc:"Our solar experts help you choose the right system size and configuration for free.",color:"text-accent-500",bg:"bg-accent-50"
},{
  icon:CreditCard,title:"Secure Payments",desc:"Safe payment options with buyer protection on every transaction through SellSolar.",color:"text-warning-500",bg:"bg-warning-50"
},{
  icon:Wrench,title:"Installation Services",desc:"Connect with certified installers in your city for professional solar system setup.",color:"text-error-500",bg:"bg-error-50"
},{
  icon:Users,title:"Trusted Community",desc:"Join thousands of buyers and sellers making Pakistan solar-powered, one home at a time.",color:"text-secondary-600",bg:"bg-secondary-50"
}];
function cx(){
  return jsx("section",{
    id:"how-it-works",className:"bg-white py-16 lg:py-20",children:jsxs("div",{
      className:"container-page",children:[jsxs("div",{
        className:"mx-auto mb-12 max-w-2xl text-center",children:[jsx("div",{
          className:"mb-2 text-sm font-semibold uppercase tracking-wide text-primary-600",children:"Why SellSolar"
        }),jsx("h2",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Pakistan's Trusted Solar Marketplace"
        }),jsx("p",{
          className:"mt-2 text-gray-500",children:"We make buying and selling solar equipment safe, simple, and affordable."
        })]
      }),jsx("div",{
        className:"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",children:ox.map(t=>{
          const e=t.icon;
          return jsxs("div",{
            className:"card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",children:[jsx("div",{
              className:`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${t.bg}`,children:jsx(e,{
                className:`h-6 w-6 ${t.color}`,strokeWidth:2
              })
            }),jsx("h3",{
              className:"text-lg font-bold text-gray-900",children:t.title
            }),jsx("p",{
              className:"mt-2 text-sm leading-relaxed text-gray-500",children:t.desc
            })]
          },t.title)
        })
      })]
    })
  })
}const ux={
  Company:["About Us","Careers","Press","Blog"],Marketplace:["Buy Solar","Sell Solar","How It Works","Pricing"],Support:["Help Center","Contact Us","Safety Tips","Report an Issue"],Legal:["Terms of Service","Privacy Policy","Cookie Policy","Disclaimer"]
},dx=[Facebook,Twitter,Instagram,Linkedin];
function hx({
  onPostAd:t
}){
  return jsxs("footer",{
    id:"contact",className:"bg-gray-900 text-gray-400",children:[jsx("div",{
      className:"border-b border-gray-800",children:jsx("div",{
        className:"container-page py-12",children:jsxs("div",{
          className:"flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-center lg:flex-row lg:text-left",children:[jsxs("div",{
            children:[jsx("h3",{
              className:"text-2xl font-extrabold text-white",children:"Ready to go solar?"
            }),jsx("p",{
              className:"mt-1 text-primary-50",children:"Post your first ad free and reach thousands of buyers across Pakistan."
            })]
          }),jsx("button",{
            onClick:t,className:"btn shrink-0 bg-white px-8 py-3.5 text-primary-600 shadow-lg hover:bg-primary-50 active:scale-[0.98]",children:"Post an Ad — It's Free"
          })]
        })
      })
    }),jsxs("div",{
      className:"container-page py-12",children:[jsxs("div",{
        className:"grid grid-cols-2 gap-8 lg:grid-cols-6",children:[jsxs("div",{
          className:"col-span-2",children:[jsxs("div",{
            className:"flex items-center gap-2",children:[jsx("div",{
              className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:jsx(Sun,{
                className:"h-5 w-5 text-white",strokeWidth:2.5
              })
            }),jsxs("span",{
              className:"text-xl font-extrabold text-white",children:["Sell",jsx("span",{
                className:"text-primary-400",children:"Solar"
              })]
            })]
          }),jsx("p",{
            className:"mt-4 max-w-xs text-sm leading-relaxed",children:"Pakistan's #1 marketplace for solar panels, inverters, batteries, and complete solar systems. Buy and sell with confidence."
          }),jsxs("div",{
            className:"mt-6 space-y-2 text-sm",children:[jsxs("a",{
              href:"mailto:info@sellsolar.pk",className:"flex items-center gap-2 hover:text-white",children:[jsx(Mail,{
                className:"h-4 w-4"
              }),"info@sellsolar.pk"]
            }),jsxs("p",{
              className:"flex items-center gap-2",children:[jsx(MapPin,{
                className:"h-4 w-4"
              }),"Islamabad, Pakistan"]
            })]
          })]
        }),Object.entries(ux).map(([e,r])=>jsxs("div",{
          children:[jsx("h4",{
            className:"mb-4 text-sm font-bold uppercase tracking-wide text-white",children:e
          }),jsx("ul",{
            className:"space-y-2.5",children:r.map(n=>jsx("li",{
              children:jsx("a",{
                href:"#",className:"text-sm transition-colors hover:text-white",children:n
              })
            },n))
          })]
        },e))]
      }),jsxs("div",{
        className:"mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 BadgeCheck-8 sm:flex-row",children:[jsx("p",{
          className:"text-sm",children:"© 2026 SellSolar. All rights reserved."
        }),jsx("div",{
          className:"flex gap-3",children:dx.map((e,r)=>jsx("a",{
            href:"#",className:"flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-primary-500",children:jsx(e,{
              className:"h-4 w-4"
            })
          },r))
        })]
      })]
    })]
  })
}function Wu(t){
  const e=t instanceof Error?t.message.toLowerCase():"";
  return e.includes("weak_password")||e.includes("pwned")||e.includes("password is known")?"This password has been found in known data breaches and cannot be used. Please choose a stronger, unique password.":e.includes("invalid login")||e.includes("invalid credentials")?"Incorrect email or password. Please try again.":e.includes("user already registered")||e.includes("already been registered")?"An account with this email already exists. Try logging in instead.":e.includes("email_rate_limit")||e.includes("rate limit")?"Too many attempts. Please wait a moment and try again.":e.includes("email not confirmed")?"Please check your email and confirm your account before logging in.":t instanceof Error&&t.message?t.message:"Something went wrong. Please try again."
}function di(t){
  let e=0;
  return t.length>=8&&e++,t.length>=12&&e++,/[A-Z]/.test(t)&&/[a-z]/.test(t)&&e++,/[0-9]/.test(t)&&e++,/[^A-Za-z0-9]/.test(t)&&e++,{
    score:e,...[{
      label:"Too short",color:"bg-gray-200"
    },{
      label:"Weak",color:"bg-error-400"
    },{
      label:"Fair",color:"bg-warning-400"
    },{
      label:"Good",color:"bg-accent-400"
    },{
      label:"Strong",color:"bg-secondary-500"
    },{
      label:"Very strong",color:"bg-secondary-600"
    }][e]
  }
}function fx(){
  const t="ABCDEFGHJKLMNPQRSTUVWXYZ",e="abcdefghjkmnpqrstuvwxyz",r="23456789",n="!@#$%^&*",s=t+e+r+n,a=o=>o[Math.floor(Math.random()*o.length)];
  let l=[a(t),a(e),a(r),a(n)];
  for(let o=0;
  o<12;
  o++)l.push(a(s));
  return l.sort(()=>Math.random()-.5).join("")
}function Bn({
  onSuccess:t,onBack:e
}){
  const{
    refreshProfile:r
  }=useAuth(),[n,s]=useState("login"),[a,l]=useState("individual"),[o,c]=useState(!1),[u,d]=useState(!1),[h,p]=useState(null),[y,w]=useState(""),[j,C]=useState(""),[g,f]=useState(""),[m,v]=useState(""),[k,x]=useState(""),[S,L]=useState(""),[z,I]=useState(""),[Y,ke]=useState(""),[ye,Be]=useState(""),le=a==="dealer",We=async()=>{
    if(p(null),le&&!S.trim()){
      p("CNIC number is mandatory for dealers");
      return
    }if(le&&!z.trim()){
      p("Business name is mandatory for dealers");
      return
    }if(!y.trim()||!j.trim()||!g.trim()){
      p("Please fill in all required fields");
      return
    }if(j.length<8){
      p("Password must be at least 8 characters.");
      return
    }if(di(j).score<3){
      p('Password is too weak. Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols. Or click "Suggest" to generate a strong password.');
      return
    }d(!0);
    try{
      const{
        data:D,error:H
      }=await supabase.auth.signUp({
        email:y,password:j,options:{
          data:{
            account_type:a,full_name:g,phone:m||null,city:k||null,cnic:le?S:null,business_name:le?z:null,business_address:le?Y:null,visiting_card_url:le?ye:null
          }
        }
      });
      if(H)throw H;
      if(!D.user)throw new Error("Sign up failed — no user returned");
      await r(D.user.id),t()
    }catch(D){
      p(Wu(D))
    }finally{
      d(!1)
    }
  },Xe=async()=>{
    if(p(null),!y.trim()||!j.trim()){
      p("Please enter your email and password");
      return
    }d(!0);
    try{
      const{
        error:A
      }=await supabase.auth.signInWithPassword({
        email:y,password:j
      });
      if(A)throw A;
      await r(),t()
    }catch(A){
      p(Wu(A))
    }finally{
      d(!1)
    }
  },_=()=>{
    n==="login"?Xe():We()
  };
  return jsxs("div",{
    className:"min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50",children:[jsx("div",{
      className:"border-b border-gray-100 bg-white/80 backdrop-blur-sm",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:e,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsx("button",{
          onClick:e,className:"text-sm font-semibold text-gray-600 hover:text-gray-900",children:"Back to Home"
        })]
      })
    }),jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-12 lg:py-16",children:jsxs("div",{
        className:"w-full max-w-md",children:[jsxs("div",{
          className:"mb-6 flex rounded-xl bg-gray-100 p-1",children:[jsx("button",{
            onClick:()=>s("login"),className:`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${n==="login"?"bg-white text-gray-900 shadow-sm":"text-gray-500"}`,children:"Login"
          }),jsx("button",{
            onClick:()=>s("signup"),className:`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${n==="signup"?"bg-white text-gray-900 shadow-sm":"text-gray-500"}`,children:"Sign Up"
          })]
        }),jsxs("div",{
          className:"card p-6 shadow-xl sm:p-8",children:[jsx("h1",{
            className:"text-2xl font-extrabold tracking-tight text-gray-900",children:n==="login"?"Welcome back":"Create your account"
          }),jsx("p",{
            className:"mt-1 text-sm text-gray-500",children:n==="login"?"Sign in to post ads and manage your listings":"Join SellSolar to buy and sell solar equipment"
          }),n==="signup"&&jsxs("div",{
            className:"mt-6",children:[jsx("label",{
              className:"mb-2 block text-sm font-semibold text-gray-700",children:"Account Type"
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-3",children:[jsxs("button",{
                onClick:()=>l("individual"),className:`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${a==="individual"?"border-primary-500 bg-primary-50":"border-gray-200 hover:border-gray-300"}`,children:[jsx(User,{
                  className:`h-6 w-6 ${a==="individual"?"text-primary-600":"text-gray-400"}`
                }),jsx("span",{
                  className:`text-sm font-semibold ${a==="individual"?"text-primary-700":"text-gray-600"}`,children:"Individual"
                })]
              }),jsxs("button",{
                onClick:()=>l("dealer"),className:`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${le?"border-primary-500 bg-primary-50":"border-gray-200 hover:border-gray-300"}`,children:[jsx(Store,{
                  className:`h-6 w-6 ${le?"text-primary-600":"text-gray-400"}`
                }),jsx("span",{
                  className:`text-sm font-semibold ${le?"text-primary-700":"text-gray-600"}`,children:"Dealer"
                })]
              })]
            }),le&&jsxs("div",{
              className:"mt-2 flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-xs text-warning-700",children:[jsx(CircleAlert,{
                className:"h-4 w-4 shrink-0 mt-0.5"
              }),jsx("span",{
                children:"As a dealer, you must provide your CNIC number, business name, and visiting card. This information is required for verification."
              })]
            })]
          }),jsxs("div",{
            className:"mt-6 space-y-4",children:[n==="signup"&&jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Full Name *"
              }),jsxs("div",{
                className:"relative",children:[jsx(User,{
                  className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                }),jsx("input",{
                  type:"text",value:g,onChange:A=>f(A.target.value),placeholder:"Enter your full name",className:"input-field pl-11"
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Email *"
              }),jsxs("div",{
                className:"relative",children:[jsx(Mail,{
                  className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                }),jsx("input",{
                  type:"email",value:y,onChange:A=>w(A.target.value),placeholder:"you@example.com",className:"input-field pl-11"
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Password *"
              }),jsxs("div",{
                className:"relative",children:[jsx(Lock,{
                  className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                }),jsx("input",{
                  type:o?"text":"password",value:j,onChange:A=>C(A.target.value),placeholder:"CircleCheckBig least 8 characters, use letters, numbers & symbols",className:"input-field pl-11 pr-11"
                }),jsx("button",{
                  onClick:()=>c(!o),className:"absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",type:"button",children:o?jsx(EyeOff,{
                    className:"h-5 w-5"
                  }):jsx(Eye,{
                    className:"h-5 w-5"
                  })
                })]
              }),n==="signup"&&j.length>0&&jsxs("div",{
                className:"mt-2",children:[jsxs("div",{
                  className:"flex items-center gap-2",children:[jsx("div",{
                    className:"h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100",children:jsx("div",{
                      className:`h-full rounded-full transition-all duration-300 ${di(j).color}`,style:{
                        width:`${di(j).score/5*100}%`
                      }
                    })
                  }),jsx("span",{
                    className:"text-xs font-semibold text-gray-500",children:di(j).label
                  })]
                }),jsxs("div",{
                  className:"mt-1.5 flex items-center justify-between",children:[jsx("p",{
                    className:"text-xs text-gray-400",children:"Use 8+ characters with letters, numbers & symbols."
                  }),jsxs("button",{
                    onClick:()=>{
                      C(fx()),c(!0)
                    },className:"flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700",type:"button",children:[jsx(RefreshCw,{
                      className:"h-3 w-3"
                    }),"Suggest"]
                  })]
                })]
              })]
            }),n==="signup"&&jsxs(Fragment,{
              children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Phone"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Phone,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  }),jsx("input",{
                    type:"tel",value:m,onChange:A=>v(A.target.value),placeholder:"0300-1234567",className:"input-field pl-11"
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"City"
                }),jsxs("div",{
                  className:"relative",children:[jsx(MapPin,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10"
                  }),jsxs("select",{
                    value:k,onChange:A=>x(A.target.value),className:"select-field pl-11",children:[jsx("option",{
                      value:"",children:"Select your city"
                    }),CITIES.map(A=>jsx("option",{
                      value:A,children:A
                    },A))]
                  })]
                })]
              }),le&&jsxs("div",{
                className:"space-y-4 rounded-xl bg-primary-50/50 p-4 ring-1 ring-primary-100",children:[jsxs("div",{
                  className:"flex items-center gap-2 text-sm font-bold text-primary-700",children:[jsx(Store,{
                    className:"h-4 w-4"
                  }),"Dealer Information (Mandatory)"]
                }),jsxs("div",{
                  children:[jsx("label",{
                    className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"CNIC Number *"
                  }),jsxs("div",{
                    className:"relative",children:[jsx(CreditCard,{
                      className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    }),jsx("input",{
                      type:"text",value:S,onChange:A=>L(A.target.value),placeholder:"12345-1234567-1",className:"input-field pl-11"
                    })]
                  })]
                }),jsxs("div",{
                  children:[jsx("label",{
                    className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Business Name *"
                  }),jsxs("div",{
                    className:"relative",children:[jsx(Store,{
                      className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    }),jsx("input",{
                      type:"text",value:z,onChange:A=>I(A.target.value),placeholder:"e.g. SolarTech Pakistan",className:"input-field pl-11"
                    })]
                  })]
                }),jsxs("div",{
                  children:[jsx("label",{
                    className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Business Address"
                  }),jsx("input",{
                    type:"text",value:Y,onChange:A=>ke(A.target.value),placeholder:"Shop address",className:"input-field"
                  })]
                }),jsxs("div",{
                  children:[jsx("label",{
                    className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Visiting Card Image URL"
                  }),jsxs("div",{
                    className:"relative",children:[jsx(Image,{
                      className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    }),jsx("input",{
                      type:"text",value:ye,onChange:A=>Be(A.target.value),placeholder:"https://...",className:"input-field pl-11"
                    })]
                  }),jsx("p",{
                    className:"mt-1 text-xs text-gray-400",children:"Provide a URL to your visiting card image for verification"
                  })]
                })]
              })]
            }),h&&jsxs("div",{
              className:"flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
                className:"h-4 w-4 shrink-0 mt-0.5"
              }),jsx("span",{
                children:h
              })]
            }),jsx("button",{
              onClick:_,disabled:u,className:"btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed",children:u?jsxs(Fragment,{
                children:[jsx(LoaderCircle,{
                  className:"h-5 w-5 animate-spin"
                }),"Please wait..."]
              }):n==="login"?"Sign In":"Create Account"
            }),jsx("p",{
              className:"text-center text-sm text-gray-500",children:n==="login"?jsxs(Fragment,{
                children:["Don't have an account?"," ",jsx("button",{
                  onClick:()=>{
                    s("signup"),p(null)
                  },className:"font-semibold text-primary-600 hover:text-primary-700",children:"Sign up"
                })]
              }):jsxs(Fragment,{
                children:["Already have an account?"," ",jsx("button",{
                  onClick:()=>{
                    s("login"),p(null)
                  },className:"font-semibold text-primary-600 hover:text-primary-700",children:"Login"
                })]
              })
            })]
          })]
        })]
      })
    })]
  })
}function mx({
  onBack:t
}){
  const[e,r]=useState([]),[n,s]=useState(!0),[a,l]=useState(""),[o,c]=useState(""),[u,d]=useState(!1);
  return useEffect(()=>{
    (async()=>{
      s(!0);
      let p=supabase.from("profiles").select("*").eq("account_type","dealer").order("is_verified_dealer",{
        ascending:!1
      }).order("created_at",{
        ascending:!1
      });
      o&&(p=p.eq("city",o)),u&&(p=p.eq("is_verified_dealer",!0)),a&&(p=p.or(`full_name.ilike.%${a}%,business_name.ilike.%${a}%`));
      const{
        data:y,error:w
      }=await p.limit(50);
      w?console.error("Error fetching dealers:",w.message):r(y||[]),s(!1)
    })()
  },[a,o,u]),jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:t,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsx("button",{
          onClick:t,className:"text-sm font-semibold text-gray-600 hover:text-gray-900",children:"Back to Home"
        })]
      })
    }),jsxs("div",{
      className:"container-page py-8 lg:py-12",children:[jsxs("div",{
        className:"mb-8",children:[jsxs("div",{
          className:"mb-2 flex items-center gap-2 text-sm font-semibold text-primary-600",children:[jsx(Users,{
            className:"h-4 w-4"
          }),"Dealer Directory"]
        }),jsx("h1",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl",children:"Verified Solar Dealers"
        }),jsx("p",{
          className:"mt-2 text-gray-500",children:"Browse trusted solar equipment dealers across Pakistan. Verified dealers have confirmed business details and CNIC."
        })]
      }),jsx("div",{
        className:"card mb-8 p-4",children:jsxs("div",{
          className:"grid grid-cols-1 gap-3 sm:grid-cols-3",children:[jsxs("div",{
            className:"relative",children:[jsx(Search,{
              className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            }),jsx("input",{
              type:"text",placeholder:"Search by name or business...",value:a,onChange:h=>l(h.target.value),className:"input-field pl-11"
            })]
          }),jsx("div",{
            children:jsxs("select",{
              value:o,onChange:h=>c(h.target.value),className:"select-field",children:[jsx("option",{
                value:"",children:"All Cities"
              }),CITIES.map(h=>jsx("option",{
                value:h,children:h
              },h))]
            })
          }),jsxs("button",{
            onClick:()=>d(!u),className:`btn justify-center ${u?"bg-secondary-500 text-white hover:bg-secondary-600":"bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"}`,children:[jsx(BadgeCheck,{
              className:"h-5 w-5"
            }),u?"Verified Only":"All Dealers"]
          })]
        })
      }),n?jsxs("div",{
        className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
          className:"h-10 w-10 animate-spin text-primary-500"
        }),jsx("p",{
          className:"mt-4 text-sm text-gray-500",children:"Loading dealers..."
        })]
      }):e.length===0?jsxs("div",{
        className:"flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center ring-1 ring-gray-200",children:[jsx(Users,{
          className:"h-16 w-16 text-gray-300"
        }),jsx("p",{
          className:"mt-4 text-lg font-semibold text-gray-700",children:"No dealers found"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Try adjusting your search or filters."
        })]
      }):jsx("div",{
        className:"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",children:e.map(h=>jsxs("div",{
          className:"card group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",children:[jsxs("div",{
            className:"flex items-start justify-between",children:[jsx("div",{
              className:"flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/20",children:jsx(Store,{
                className:"h-7 w-7 text-white"
              })
            }),h.is_verified_dealer&&jsxs("span",{
              className:"flex items-center gap-1 rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-700",children:[jsx(BadgeCheck,{
                className:"h-3.5 w-3.5"
              }),"Verified"]
            })]
          }),jsx("h3",{
            className:"mt-4 text-lg font-bold text-gray-900",children:h.business_name||h.full_name
          }),jsx("p",{
            className:"text-sm text-gray-500",children:h.full_name
          }),jsxs("div",{
            className:"mt-3 space-y-1.5 text-sm text-gray-600",children:[h.city&&jsxs("div",{
              className:"flex items-center gap-2",children:[jsx(MapPin,{
                className:"h-4 w-4 text-gray-400"
              }),h.city]
            }),h.phone&&jsxs("div",{
              className:"flex items-center gap-2",children:[jsx(Phone,{
                className:"h-4 w-4 text-gray-400"
              }),h.phone]
            }),h.business_address&&jsxs("div",{
              className:"flex items-start gap-2",children:[jsx(Store,{
                className:"h-4 w-4 mt-0.5 text-gray-400 shrink-0"
              }),jsx("span",{
                className:"line-clamp-2",children:h.business_address
              })]
            })]
          }),h.cnic&&jsxs("div",{
            className:"mt-3 border-t border-gray-100 BadgeCheck-3 text-xs text-gray-400",children:["CNIC: ",h.cnic.slice(0,5),"••••••",h.cnic.slice(-1)]
          })]
        },h.id))
      })]
    })]
  })
}const px=["panel","inverter","battery","complete_system"],gx=["new","used"];
function yx({
  onBack:t,onPosted:e
}){
  const{
    profile:r
  }=useAuth(),[n,s]=useState(!1),[a,l]=useState(null),[o,c]=useState(!1),[u,d]=useState(""),[h,p]=useState(""),[y,w]=useState("panel"),[j,C]=useState("new"),[g,f]=useState(""),[m,v]=useState((r==null?void 0:r.city)||""),[k,x]=useState(""),[S,L]=useState(""),[z,I]=useState(""),[Y,ke]=useState(""),[ye,Be]=useState((r==null?void 0:r.full_name)||""),[le,We]=useState((r==null?void 0:r.phone)||""),Xe=async()=>{
    if(l(null),!u.trim()||!h.trim()||!g.trim()||!m.trim()){
      l("Please fill in all required fields (title, brand, price, city)");
      return
    }const _=parseFloat(g);
    if(isNaN(_)||_<0){
      l("Please enter a valid price");
      return
    }s(!0);
    try{
      const{
        error:A
      }=await supabase.from("solar_listings").insert({
        title:u.trim(),brand:h.trim(),category:y,condition:j,price:_,city:m.trim(),capacity_kw:k?parseFloat(k):null,warranty_years:S?parseInt(S):null,image_url:z.trim()||null,description:Y.trim()||null,featured:!1,seller_name:ye.trim()||(r==null?void 0:r.full_name)||null,seller_phone:le.trim()||(r==null?void 0:r.phone)||null,views:0
      });
      if(A)throw A;
      c(!0),setTimeout(()=>{
        e()
      },2e3)
    }catch(A){
      l(A instanceof Error?A.message:"Failed to post ad. Please try again.")
    }finally{
      s(!1)
    }
  };
  return o?jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:jsxs("div",{
        className:"card max-w-md p-8 text-center",children:[jsx("div",{
          className:"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100",children:jsx(CircleCheck,{
            className:"h-8 w-8 text-secondary-600"
          })
        }),jsx("h2",{
          className:"mt-4 text-2xl font-extrabold text-gray-900",children:"Ad Posted Successfully!"
        }),jsx("p",{
          className:"mt-2 text-sm text-gray-500",children:"Your listing is now live on SellSolar. Buyers can find it in the listings section."
        }),jsx("p",{
          className:"mt-4 text-xs text-gray-400",children:"Redirecting to home..."
        })]
      })
    })
  }):jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:t,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsxs("button",{
          onClick:t,className:"flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Home"]
        })]
      })
    }),jsx("div",{
      className:"container-page py-8 lg:py-12",children:jsxs("div",{
        className:"mx-auto max-w-2xl",children:[jsx("h1",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Post a New Ad"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Fill in the details below to list your solar equipment for sale."
        }),jsx("div",{
          className:"card mt-6 p-6 sm:p-8",children:jsxs("div",{
            className:"space-y-5",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Ad Title *"
              }),jsx("input",{
                type:"text",value:u,onChange:_=>d(_.target.value),placeholder:"e.g. Longi 550W Monocrystalline Solar Panel",className:"input-field"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Category *"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Tag,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10"
                  }),jsx("select",{
                    value:y,onChange:_=>w(_.target.value),className:"select-field pl-11",children:px.map(_=>jsx("option",{
                      value:_,children:CATEGORIES[_]
                    },_))
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Condition *"
                }),jsx("div",{
                  className:"flex gap-2",children:gx.map(_=>jsx("button",{
                    onClick:()=>C(_),className:`flex-1 rounded-xl border-2 py-3 text-sm font-semibold capitalize transition-all ${j===_?"border-primary-500 bg-primary-50 text-primary-700":"border-gray-200 text-gray-600 hover:border-gray-300"}`,children:_
                  },_))
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Brand *"
                }),jsxs("select",{
                  value:h,onChange:_=>p(_.target.value),className:"select-field",children:[jsx("option",{
                    value:"",children:"Select brand"
                  }),BRANDS.map(_=>jsx("option",{
                    value:_,children:_
                  },_)),jsx("option",{
                    value:"Other",children:"Other"
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Price (PKR) *"
                }),jsxs("div",{
                  className:"relative",children:[jsx(DollarSign,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  }),jsx("input",{
                    type:"number",value:g,onChange:_=>f(_.target.value),placeholder:"e.g. 18500",className:"input-field pl-11"
                  })]
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"City *"
                }),jsxs("div",{
                  className:"relative",children:[jsx(MapPin,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10"
                  }),jsxs("select",{
                    value:m,onChange:_=>v(_.target.value),className:"select-field pl-11",children:[jsx("option",{
                      value:"",children:"Select city"
                    }),CITIES.map(_=>jsx("option",{
                      value:_,children:_
                    },_))]
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Capacity (kW)"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Zap,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  }),jsx("input",{
                    type:"number",value:k,onChange:_=>x(_.target.value),placeholder:"e.g. 0.55",className:"input-field pl-11"
                  })]
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Warranty (Years)"
                }),jsxs("div",{
                  className:"relative",children:[jsx(ShieldCheck,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  }),jsx("input",{
                    type:"number",value:S,onChange:_=>L(_.target.value),placeholder:"e.g. 12",className:"input-field pl-11"
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Image URL"
                }),jsxs("div",{
                  className:"relative",children:[jsx(Image,{
                    className:"absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  }),jsx("input",{
                    type:"text",value:z,onChange:_=>I(_.target.value),placeholder:"https://...",className:"input-field pl-11"
                  })]
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Description"
              }),jsx("textarea",{
                value:Y,onChange:_=>ke(_.target.value),rows:4,placeholder:"Describe your product, condition, features...",className:"input-field resize-none"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Seller Name"
                }),jsx("input",{
                  type:"text",value:ye,onChange:_=>Be(_.target.value),placeholder:"Your name",className:"input-field"
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Seller Phone"
                }),jsx("input",{
                  type:"tel",value:le,onChange:_=>We(_.target.value),placeholder:"0300-1234567",className:"input-field"
                })]
              })]
            }),a&&jsxs("div",{
              className:"flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
                className:"h-4 w-4 shrink-0 mt-0.5"
              }),jsx("span",{
                children:a
              })]
            }),jsx("button",{
              onClick:Xe,disabled:n,className:"btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed",children:n?jsxs(Fragment,{
                children:[jsx(LoaderCircle,{
                  className:"h-5 w-5 animate-spin"
                }),"Posting Ad..."]
              }):"Post EyeOff Ad"
            })]
          })
        })]
      })
    })]
  })
}function xx({
  onBack:t
}){
  const{
    profile:e
  }=useAuth(),[r,n]=useState("users"),[s,a]=useState([]),[l,o]=useState([]),[c,u]=useState(!0),[d,h]=useState(null),[p,y]=useState(null),w=(e==null?void 0:e.is_admin)===!0,j=useCallback(async()=>{
    const{
      data:x,error:S
    }=await supabase.from("profiles").select("*").order("created_at",{
      ascending:!1
    });
    S?h(S.message):a(x||[])
  },[]),C=useCallback(async()=>{
    const{
      data:x,error:S
    }=await supabase.from("solar_listings").select("*").order("created_at",{
      ascending:!1
    });
    S?h(S.message):o(x||[])
  },[]);
  useEffect(()=>{
    if(!w){
      u(!1);
      return
    }u(!0),h(null),Promise.all([j(),C()]).finally(()=>u(!1))
  },[w,j,C]);
  const g=async x=>{
    y(x);
    const{
      error:S
    }=await supabase.rpc("admin_verify_dealer",{
      target_user_id:x
    });
    S?h(S.message):a(L=>L.map(z=>z.id===x?{
      ...z,is_verified_dealer:!0
    }:z)),y(null)
  },f=async x=>{
    if(!confirm("Are you sure you want to delete this listing?"))return;
    y(x);
    const{
      error:S
    }=await supabase.rpc("admin_delete_listing",{
      listing_id:x
    });
    S?h(S.message):o(L=>L.filter(z=>z.id!==x)),y(null)
  },m=async x=>{
    if(!confirm("Are you sure you want to delete this user profile? This cannot be undone."))return;
    y(x);
    const{
      error:S
    }=await supabase.rpc("admin_delete_profile",{
      target_user_id:x
    });
    S?h(S.message):a(L=>L.filter(z=>z.id!==x)),y(null)
  };
  if(!w)return jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:jsxs("div",{
        className:"card max-w-md p-8 text-center",children:[jsx("div",{
          className:"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100",children:jsx(ShieldCheck,{
            className:"h-8 w-8 text-error-600"
          })
        }),jsx("h2",{
          className:"mt-4 text-2xl font-extrabold text-gray-900",children:"Access Denied"
        }),jsx("p",{
          className:"mt-2 text-sm text-gray-500",children:"You need admin privileges to access this page."
        }),jsxs("button",{
          onClick:t,className:"btn-ghost mt-6",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Home"]
        })]
      })
    })
  });
  const v=s.filter(x=>x.account_type==="dealer");
  s.filter(x=>x.account_type==="individual");
  const k=[{
    id:"users",label:"All Users",icon:Users,count:s.length
  },{
    id:"dealers",label:"Dealers",icon:Store,count:v.length
  },{
    id:"listings",label:"Listings",icon:Tag,count:l.length
  }];
  return jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:t,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          }),jsx("span",{
            className:"ml-2 rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-bold text-error-700",children:"Admin"
          })]
        }),jsxs("button",{
          onClick:t,className:"flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Home"]
        })]
      })
    }),jsxs("div",{
      className:"container-page py-8 lg:py-12",children:[jsxs("div",{
        className:"mb-8",children:[jsxs("div",{
          className:"mb-2 flex items-center gap-2 text-sm font-semibold text-error-600",children:[jsx(ShieldCheck,{
            className:"h-4 w-4"
          }),"Admin Dashboard"]
        }),jsx("h1",{
          className:"text-3xl font-extrabold tracking-tight text-gray-900",children:"Manage Users & Listings"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Verify dealers, manage user accounts, and moderate listings."
        })]
      }),jsx("div",{
        className:"mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4",children:[{
          label:"Total Users",value:s.length,icon:Users,color:"text-accent-500 bg-accent-50"
        },{
          label:"Dealers",value:v.length,icon:Store,color:"text-primary-500 bg-primary-50"
        },{
          label:"Verified",value:v.filter(x=>x.is_verified_dealer).length,icon:BadgeCheck,color:"text-secondary-500 bg-secondary-50"
        },{
          label:"Listings",value:l.length,icon:Tag,color:"text-warning-500 bg-warning-50"
        }].map(x=>{
          const S=x.icon;
          return jsxs("div",{
            className:"card p-4",children:[jsx("div",{
              className:`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${x.color}`,children:jsx(S,{
                className:"h-5 w-5"
              })
            }),jsx("div",{
              className:"text-2xl font-extrabold text-gray-900",children:x.value
            }),jsx("div",{
              className:"text-xs font-medium text-gray-500",children:x.label
            })]
          },x.label)
        })
      }),d&&jsxs("div",{
        className:"mb-6 flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
          className:"h-4 w-4 shrink-0 mt-0.5"
        }),jsx("span",{
          children:d
        }),jsx("button",{
          onClick:()=>h(null),className:"ml-auto text-error-400 hover:text-error-600",children:"×"
        })]
      }),jsx("div",{
        className:"mb-6 flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 scrollbar-hide",children:k.map(x=>{
          const S=x.icon;
          return jsxs("button",{
            onClick:()=>n(x.id),className:`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${r===x.id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`,children:[jsx(S,{
              className:"h-4 w-4"
            }),x.label,jsx("span",{
              className:"rounded-full bg-gray-200 px-2 py-0.5 text-xs",children:x.count
            })]
          },x.id)
        })
      }),c?jsxs("div",{
        className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
          className:"h-10 w-10 animate-spin text-primary-500"
        }),jsx("p",{
          className:"mt-4 text-sm text-gray-500",children:"Loading data..."
        })]
      }):r==="listings"?jsx("div",{
        className:"space-y-3",children:l.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No listings found."
        }):l.map(x=>jsxs("div",{
          className:"card flex items-center gap-4 p-4",children:[jsx("div",{
            className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:x.image_url?jsx("img",{
              src:x.image_url,alt:x.title,className:"h-full w-full object-cover"
            }):jsx("div",{
              className:"flex h-full items-center justify-center",children:jsx(Tag,{
                className:"h-6 w-6 text-gray-300"
              })
            })
          }),jsxs("div",{
            className:"min-w-0 flex-1",children:[jsx("h3",{
              className:"truncate text-sm font-bold text-gray-900",children:x.title
            }),jsxs("div",{
              className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
                className:"font-semibold text-primary-600",children:CATEGORIES[x.category]
              }),jsx("span",{
                children:"•"
              }),jsx("span",{
                children:x.brand
              }),jsx("span",{
                children:"•"
              }),jsx("span",{
                children:x.city
              }),jsx("span",{
                children:"•"
              }),jsx("span",{
                className:"font-bold text-gray-700",children:formatPrice(x.price)
              }),x.featured&&jsxs(Fragment,{
                children:[jsx("span",{
                  children:"•"
                }),jsx("span",{
                  className:"rounded-full bg-primary-100 px-2 py-0.5 font-semibold text-primary-700",children:"Featured"
                })]
              })]
            })]
          }),jsx("button",{
            onClick:()=>f(x.id),disabled:p===x.id,className:"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-error-500 transition-colors hover:bg-error-50 disabled:opacity-50",children:p===x.id?jsx(LoaderCircle,{
              className:"h-4 w-4 animate-spin"
            }):jsx(Cn,{
              className:"h-4 w-4"
            })
          })]
        },x.id))
      }):jsx("div",{
        className:"space-y-3",children:(r==="dealers"?v:s).length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:r==="dealers"?"No dealers found.":"No users found."
        }):(r==="dealers"?v:s).map(x=>jsx("div",{
          className:"card p-4",children:jsxs("div",{
            className:"flex items-start gap-4",children:[jsx("div",{
              className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:x.account_type==="dealer"?jsx(Store,{
                className:"h-6 w-6 text-white"
              }):jsx("span",{
                className:"text-lg font-bold text-white",children:x.full_name.charAt(0).toUpperCase()
              })
            }),jsxs("div",{
              className:"min-w-0 flex-1",children:[jsxs("div",{
                className:"flex flex-wrap items-center gap-2",children:[jsx("h3",{
                  className:"text-sm font-bold text-gray-900",children:x.business_name||x.full_name
                }),x.account_type==="dealer"&&jsx("span",{
                  className:"rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:"Dealer"
                }),x.is_verified_dealer&&jsxs("span",{
                  className:"flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700",children:[jsx(BadgeCheck,{
                    className:"h-3 w-3"
                  }),"Verified"]
                }),x.is_admin&&jsxs("span",{
                  className:"flex items-center gap-1 rounded-full bg-error-100 px-2 py-0.5 text-xs font-semibold text-error-700",children:[jsx(ShieldCheck,{
                    className:"h-3 w-3"
                  }),"Admin"]
                })]
              }),jsxs("div",{
                className:"mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500",children:[x.city&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(MapPin,{
                    className:"h-3 w-3"
                  }),x.city]
                }),x.phone&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(Phone,{
                    className:"h-3 w-3"
                  }),x.phone]
                }),x.cnic&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(CreditCard,{
                    className:"h-3 w-3"
                  }),x.cnic]
                }),x.business_address&&jsxs("span",{
                  className:"flex items-center gap-1",children:[jsx(Store,{
                    className:"h-3 w-3"
                  }),x.business_address]
                })]
              }),x.visiting_card_url&&jsxs("a",{
                href:x.visiting_card_url,target:"_blank",rel:"noopener noreferrer",className:"mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700",children:[jsx(Eye,{
                  className:"h-3 w-3"
                }),"View Visiting Card"]
              })]
            }),jsxs("div",{
              className:"flex shrink-0 items-center gap-2",children:[x.account_type==="dealer"&&!x.is_verified_dealer&&jsxs("button",{
                onClick:()=>g(x.id),disabled:p===x.id,className:"flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary-600 disabled:opacity-50",children:[p===x.id?jsx(LoaderCircle,{
                  className:"h-3.5 w-3.5 animate-spin"
                }):jsx(BadgeCheck,{
                  className:"h-3.5 w-3.5"
                }),"Verify"]
              }),!x.is_admin&&jsx("button",{
                onClick:()=>m(x.id),disabled:p===x.id,className:"flex h-9 w-9 items-center justify-center rounded-lg text-error-500 transition-colors hover:bg-error-50 disabled:opacity-50",children:p===x.id?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(Cn,{
                  className:"h-4 w-4"
                })
              })]
            })]
          })
        },x.id))
      })]
    })]
  })
}function Df({
  navItems:t,activeTab:e,onTabChange:r,onBack:n,badgeColor:s="bg-error-100 text-error-700",headerLabel:a,headerIcon:l,children:o
}){
  var j;
  const[c,u]=useState(!1),{
    user:d,profile:h,signOut:p
  }=useAuth(),y=C=>{
    r(C),u(!1)
  },w=async()=>{
    await p(),n()
  };
  return jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-200 bg-white",children:jsxs("div",{
        className:"flex h-16 items-center justify-between px-4 lg:px-6",children:[jsxs("div",{
          className:"flex items-center gap-3",children:[jsx("button",{
            onClick:()=>u(!c),className:"rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden",children:c?jsx(X,{
              className:"h-5 w-5"
            }):jsx(Menu,{
              className:"h-5 w-5"
            })
          }),jsxs("button",{
            onClick:n,className:"flex items-center gap-2",children:[jsx("div",{
              className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
                className:"h-5 w-5 text-white",strokeWidth:2.5
              })
            }),jsxs("span",{
              className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
                className:"text-primary-500",children:"Solar"
              })]
            }),jsx("span",{
              className:`ml-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${s}`,children:a
            })]
          })]
        }),jsxs("div",{
          className:"flex items-center gap-3",children:[jsxs("button",{
            className:"relative rounded-lg p-2 text-gray-600 hover:bg-gray-100",children:[jsx(Bell,{
              className:"h-5 w-5"
            }),jsx("span",{
              className:"absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error-500"
            })]
          }),jsx("div",{
            className:"relative",children:jsxs("button",{
              className:"flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50",children:[jsx("div",{
                className:"flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white",children:((h==null?void 0:h.full_name)||(d==null?void 0:d.email)||"U").charAt(0).toUpperCase()
              }),jsx("span",{
                className:"hidden sm:inline",children:((j=h==null?void 0:h.full_name)==null?void 0:j.split(" ")[0])||"User"
              }),jsx(ChevronDown,{
                className:"h-4 w-4 text-gray-400"
              })]
            })
          }),jsxs("button",{
            onClick:w,className:"flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-error-600 hover:bg-error-50",children:[jsx(LogOut,{
              className:"h-4 w-4"
            }),jsx("span",{
              className:"hidden sm:inline",children:"Sign Out"
            })]
          })]
        })]
      })
    }),jsxs("div",{
      className:"flex",children:[jsxs("aside",{
        className:`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${c?"translate-x-0":"-translate-x-full"}`,children:[jsxs("nav",{
          className:"flex flex-col gap-0.5 p-3",children:[jsx("div",{
            className:"mb-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3",children:jsxs("div",{
              className:"flex items-center gap-3",children:[jsx("div",{
                className:"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-md",children:jsx("span",{
                  className:"text-lg font-bold text-white",children:((h==null?void 0:h.full_name)||(d==null?void 0:d.email)||"U").charAt(0).toUpperCase()
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("p",{
                  className:"truncate text-sm font-bold text-gray-900",children:(h==null?void 0:h.full_name)||"User"
                }),jsx("p",{
                  className:"truncate text-xs text-gray-500",children:d==null?void 0:d.email
                }),jsxs("div",{
                  className:"mt-0.5 flex items-center gap-1.5",children:[jsxs("span",{
                    className:`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${s}`,children:[jsx(l,{
                      className:"h-3 w-3"
                    }),a]
                  }),(h==null?void 0:h.is_verified_dealer)&&jsxs("span",{
                    className:"inline-flex items-center gap-0.5 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-bold text-secondary-700",children:[jsx(BadgeCheck,{
                      className:"h-3 w-3"
                    }),"Verified"]
                  })]
                })]
              })]
            })
          }),jsxs("div",{
            className:"mb-2 flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400",children:[jsx(l,{
              className:"h-3.5 w-3.5"
            }),a," Menu"]
          }),t.map(C=>{
            const g=C.icon,f=e===C.id;
            return jsxs("button",{
              onClick:()=>y(C.id),className:`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${f?"bg-primary-50 text-primary-700":"text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`,children:[jsx(g,{
                className:`h-4.5 w-4.5 ${f?"text-primary-600":"text-gray-400"}`
              }),jsx("span",{
                className:"flex-1 text-left",children:C.label
              }),C.badge!==void 0&&C.badge>0&&jsx("span",{
                className:"rounded-full bg-error-100 px-2 py-0.5 text-xs font-bold text-error-700",children:C.badge
              })]
            },C.id)
          })]
        }),jsx("div",{
          className:"mt-auto border-t border-gray-100 p-3",children:jsxs("button",{
            onClick:n,className:"flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50",children:[jsx(ArrowLeft,{
              className:"h-4 w-4"
            }),"Back to Site"]
          })
        })]
      }),c&&jsx("div",{
        onClick:()=>u(!1),className:"fixed inset-0 top-16 z-20 bg-black/30 lg:hidden"
      }),jsx("main",{
        className:"min-h-[calc(100vh-4rem)] flex-1 overflow-x-hidden",children:o
      })]
    })]
  })
}function vx({
  onBack:t
}){
  const{
    profile:e
  }=useAuth(),[r,n]=useState("dashboard"),[s,a]=useState([]),[l,o]=useState([]),[c,u]=useState([]),[d,h]=useState([]),[p,y]=useState([]),[w,j]=useState([]),[C,g]=useState(!0),[f,m]=useState(null),[v,k]=useState(null),[x,S]=useState(""),[L,z]=useState("all"),[I,Y]=useState(null),[ke,ye]=useState(""),Be=(e==null?void 0:e.is_admin)===!0,le=useCallback(async()=>{
    const[b,O,q,V,_a,Bs]=await Promise.all([supabase.from("profiles").select("*").order("created_at",{
      ascending:!1
    }),supabase.from("solar_listings").select("*").order("created_at",{
      ascending:!1
    }),supabase.from("categories").select("*").order("sort_order",{
      ascending:!0
    }),supabase.from("brands").select("*").order("name",{
      ascending:!0
    }),supabase.from("enquiries").select("*").order("created_at",{
      ascending:!1
    }),supabase.from("advertisements").select("*").order("created_at",{
      ascending:!1
    })]);
    b.error?m(b.error.message):a(b.data||[]),O.error?m(O.error.message):o(O.data||[]),u(q.data||[]),h(V.data||[]),y(_a.data||[]),j(Bs.data||[])
  },[]);
  useEffect(()=>{
    if(!Be){
      g(!1);
      return
    }g(!0),m(null),le().finally(()=>g(!1))
  },[Be,le]);
  const We=async b=>{
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_update_listing_status",{
      p_listing_id:b,p_new_status:"approved"
    });
    O?m(O.message):o(q=>q.map(V=>V.id===b?{
      ...V,status:"approved",rejection_reason:null
    }:V)),k(null)
  },Xe=async()=>{
    if(!I)return;
    k(I.listingId);
    const{
      error:b
    }=await supabase.rpc("admin_update_listing_status",{
      p_listing_id:I.listingId,p_new_status:"rejected",p_reason:ke||"Does not meet guidelines"
    });
    b?m(b.message):o(O=>O.map(q=>q.id===I.listingId?{
      ...q,status:"rejected",rejection_reason:ke
    }:q)),k(null),Y(null),ye("")
  },_=async b=>{
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_toggle_featured",{
      p_listing_id:b
    });
    O?m(O.message):o(q=>q.map(V=>V.id===b?{
      ...V,featured:!V.featured
    }:V)),k(null)
  },A=async b=>{
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_toggle_sponsored",{
      p_listing_id:b
    });
    O?m(O.message):o(q=>q.map(V=>V.id===b?{
      ...V,sponsored:!V.sponsored
    }:V)),k(null)
  },D=async b=>{
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_toggle_sold",{
      p_listing_id:b
    });
    O?m(O.message):o(q=>q.map(V=>V.id===b?{
      ...V,is_sold:!V.is_sold
    }:V)),k(null)
  },H=async b=>{
    if(!confirm("Delete this listing permanently?"))return;
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_delete_listing",{
      listing_id:b
    });
    O?m(O.message):o(q=>q.filter(V=>V.id!==b)),k(null)
  },X=async b=>{
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_verify_dealer",{
      target_user_id:b
    });
    O?m(O.message):a(q=>q.map(V=>V.id===b?{
      ...V,is_verified_dealer:!0
    }:V)),k(null)
  },St=async b=>{
    if(!confirm("Delete this user profile?"))return;
    k(b);
    const{
      error:O
    }=await supabase.rpc("admin_delete_profile",{
      target_user_id:b
    });
    O?m(O.message):a(q=>q.filter(V=>V.id!==b)),k(null)
  },we=s.filter(b=>b.account_type==="dealer"),Ve=l.filter(b=>b.status==="pending"),oe=l.filter(b=>b.status==="approved"),xt=l.filter(b=>b.status==="rejected"),yr=l.filter(b=>b.featured),Ft=l.filter(b=>b.sponsored),Ds=l.reduce((b,O)=>b+(O.views||0),0),Ms=l.filter(b=>{
    const O=!x||b.title.toLowerCase().includes(x.toLowerCase())||b.brand.toLowerCase().includes(x.toLowerCase())||b.city.toLowerCase().includes(x.toLowerCase()),q=L==="all"||b.status===L;
    return O&&q
  }),Us=[{
    id:"dashboard",label:"Dashboard",icon:LayoutDashboard
  },{
    id:"users",label:"Users",icon:Users,badge:s.length
  },{
    id:"dealers",label:"Dealers",icon:Store,badge:we.length
  },{
    id:"products",label:"Products",icon:Tag,badge:l.length
  },{
    id:"pending",label:"Pending Approvals",icon:Clock,badge:Ve.length
  },{
    id:"categories",label:"Categories",icon:Layers
  },{
    id:"brands",label:"Brands",icon:Award
  },{
    id:"locations",label:"Locations",icon:MapPin
  },{
    id:"advertisements",label:"Advertisements",icon:Megaphone
  },{
    id:"featured",label:"Featured Products",icon:Star,badge:yr.length
  },{
    id:"sponsored",label:"Sponsored Products",icon:DollarSign,badge:Ft.length
  },{
    id:"enquiries",label:"Messages / Enquiries",icon:MessageSquare,badge:p.length
  },{
    id:"reviews",label:"Reviews & Ratings",icon:Star
  },{
    id:"reports",label:"Reports & Analytics",icon:ChartColumn
  },{
    id:"cms",label:"CMS",icon:FileText
  },{
    id:"settings",label:"Website Settings",icon:Settings
  },{
    id:"roles",label:"Roles & Permissions",icon:ShieldCheck
  },{
    id:"notifications",label:"Notifications",icon:Bell
  },{
    id:"system-logs",label:"System Logs",icon:ScrollText
  },{
    id:"audit-logs",label:"Audit Logs",icon:ScrollText
  }],ja=[{
    label:"Total Users",value:s.length,icon:Users,color:"text-accent-500 bg-accent-50"
  },{
    label:"Total Dealers",value:we.length,icon:Store,color:"text-primary-500 bg-primary-50"
  },{
    label:"Total Products",value:l.length,icon:Tag,color:"text-gray-600 bg-gray-100"
  },{
    label:"Pending",value:Ve.length,icon:Clock,color:"text-warning-500 bg-warning-50"
  },{
    label:"Approved",value:oe.length,icon:CircleCheckBig,color:"text-secondary-500 bg-secondary-50"
  },{
    label:"Rejected",value:xt.length,icon:CircleX,color:"text-error-500 bg-error-50"
  },{
    label:"Featured",value:yr.length,icon:Star,color:"text-primary-500 bg-primary-50"
  },{
    label:"Sponsored",value:Ft.length,icon:DollarSign,color:"text-accent-500 bg-accent-50"
  },{
    label:"Active Ads",value:w.filter(b=>b.is_active).length,icon:Megaphone,color:"text-primary-500 bg-primary-50"
  },{
    label:"Total Enquiries",value:p.length,icon:MessageSquare,color:"text-gray-600 bg-gray-100"
  },{
    label:"Total Views",value:Ds,icon:Eye,color:"text-accent-500 bg-accent-50"
  }];
  if(!Be)return jsx("div",{
    className:"min-h-screen bg-gray-50 flex flex-col items-center justify-center py-24",children:jsxs("div",{
      className:"card max-w-md p-8 text-center",children:[jsx("div",{
        className:"mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100",children:jsx(ShieldCheck,{
          className:"h-8 w-8 text-error-600"
        })
      }),jsx("h2",{
        className:"mt-4 text-2xl font-extrabold text-gray-900",children:"Access Denied"
      }),jsx("p",{
        className:"mt-2 text-sm text-gray-500",children:"You need admin privileges to access this page."
      }),jsx("button",{
        onClick:t,className:"btn-ghost mt-6",children:"Back to Home"
      })]
    })
  });
  const Bt=b=>jsxs("div",{
    className:"card flex items-center gap-4 p-4",children:[jsx("div",{
      className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:b.image_url?jsx("img",{
        src:b.image_url,alt:b.title,className:"h-full w-full object-cover"
      }):jsx("div",{
        className:"flex h-full items-center justify-center",children:jsx(Tag,{
          className:"h-6 w-6 text-gray-300"
        })
      })
    }),jsxs("div",{
      className:"min-w-0 flex-1",children:[jsx("h3",{
        className:"truncate text-sm font-bold text-gray-900",children:b.title
      }),jsxs("div",{
        className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
          className:"font-semibold text-primary-600",children:CATEGORIES[b.category]
        }),jsx("span",{
          children:"•"
        }),jsx("span",{
          children:b.brand
        }),jsx("span",{
          children:"•"
        }),jsx("span",{
          children:b.city
        }),jsx("span",{
          children:"•"
        }),jsx("span",{
          className:"font-bold text-gray-700",children:formatPrice(b.price)
        }),jsx("span",{
          children:"•"
        }),jsxs("span",{
          className:"flex items-center gap-0.5",children:[jsx(Eye,{
            className:"h-3 w-3"
          }),b.views]
        }),b.featured&&jsx("span",{
          className:"rounded-full bg-primary-100 px-2 py-0.5 font-semibold text-primary-700",children:"Featured"
        }),b.sponsored&&jsx("span",{
          className:"rounded-full bg-accent-100 px-2 py-0.5 font-semibold text-accent-700",children:"Sponsored"
        }),b.is_sold&&jsx("span",{
          className:"rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-700",children:"Sold"
        })]
      }),jsx("div",{
        className:"mt-1",children:jsx("span",{
          className:`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${b.status==="approved"?"bg-secondary-100 text-secondary-700":b.status==="pending"?"bg-warning-100 text-warning-700":b.status==="rejected"?"bg-error-100 text-error-700":"bg-gray-100 text-gray-600"}`,children:b.status.charAt(0).toUpperCase()+b.status.slice(1)
        })
      })]
    }),jsxs("div",{
      className:"flex shrink-0 flex-wrap items-center justify-end gap-1.5",children:[b.status==="pending"&&jsxs(Fragment,{
        children:[jsxs("button",{
          onClick:()=>We(b.id),disabled:v===b.id,className:"flex items-center gap-1 rounded-lg bg-secondary-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-secondary-600 disabled:opacity-50",children:[v===b.id?jsx(LoaderCircle,{
            className:"h-3 w-3 animate-spin"
          }):jsx(CircleCheckBig,{
            className:"h-3 w-3"
          }),"Approve"]
        }),jsxs("button",{
          onClick:()=>Y({
            listingId:b.id
          }),disabled:v===b.id,className:"flex items-center gap-1 rounded-lg bg-error-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-error-600 disabled:opacity-50",children:[jsx(CircleX,{
            className:"h-3 w-3"
          })," Reject"]
        })]
      }),b.status==="rejected"&&jsxs("button",{
        onClick:()=>We(b.id),disabled:v===b.id,className:"flex items-center gap-1 rounded-lg bg-secondary-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-secondary-600 disabled:opacity-50",children:[jsx(CircleCheckBig,{
          className:"h-3 w-3"
        })," Approve"]
      }),jsx("button",{
        onClick:()=>_(b.id),disabled:v===b.id,className:`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${b.featured?"bg-primary-100 text-primary-600":"text-gray-400 hover:bg-gray-100"}`,title:"Toggle Featured",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(Star,{
          className:"h-3.5 w-3.5"
        })
      }),jsx("button",{
        onClick:()=>A(b.id),disabled:v===b.id,className:`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${b.sponsored?"bg-accent-100 text-accent-600":"text-gray-400 hover:bg-gray-100"}`,title:"Toggle Sponsored",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(DollarSign,{
          className:"h-3.5 w-3.5"
        })
      }),jsx("button",{
        onClick:()=>D(b.id),disabled:v===b.id,className:`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${b.is_sold?"bg-gray-200 text-gray-700":"text-gray-400 hover:bg-gray-100"}`,title:"Toggle Sold",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(CircleCheckBig,{
          className:"h-3.5 w-3.5"
        })
      }),jsx("button",{
        onClick:()=>H(b.id),disabled:v===b.id,className:"flex h-8 w-8 items-center justify-center rounded-lg text-error-500 transition-colors hover:bg-error-50 disabled:opacity-50",title:"Delete",children:v===b.id?jsx(LoaderCircle,{
          className:"h-3.5 w-3.5 animate-spin"
        }):jsx(Cn,{
          className:"h-3.5 w-3.5"
        })
      })]
    })]
  },b.id),zs=(b,O)=>jsx("div",{
    className:"card p-4",children:jsxs("div",{
      className:"flex items-start gap-4",children:[jsx("div",{
        className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:b.account_type==="dealer"?jsx(Store,{
          className:"h-6 w-6 text-white"
        }):jsx("span",{
          className:"text-lg font-bold text-white",children:b.full_name.charAt(0).toUpperCase()
        })
      }),jsxs("div",{
        className:"min-w-0 flex-1",children:[jsxs("div",{
          className:"flex flex-wrap items-center gap-2",children:[jsx("h3",{
            className:"text-sm font-bold text-gray-900",children:b.business_name||b.full_name
          }),b.account_type==="dealer"&&jsx("span",{
            className:"rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:"Dealer"
          }),b.is_verified_dealer&&jsxs("span",{
            className:"flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700",children:[jsx(BadgeCheck,{
              className:"h-3 w-3"
            })," Verified"]
          }),b.is_admin&&jsxs("span",{
            className:"flex items-center gap-1 rounded-full bg-error-100 px-2 py-0.5 text-xs font-semibold text-error-700",children:[jsx(ShieldCheck,{
              className:"h-3 w-3"
            })," Admin"]
          })]
        }),jsxs("div",{
          className:"mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500",children:[b.city&&jsxs("span",{
            className:"flex items-center gap-1",children:[jsx(MapPin,{
              className:"h-3 w-3"
            }),b.city]
          }),b.phone&&jsxs("span",{
            className:"flex items-center gap-1",children:[jsx(Phone,{
              className:"h-3 w-3"
            }),b.phone]
          }),b.cnic&&jsxs("span",{
            className:"flex items-center gap-1",children:[jsx(CreditCard,{
              className:"h-3 w-3"
            }),b.cnic]
          })]
        })]
      }),jsxs("div",{
        className:"flex shrink-0 items-center gap-2",children:[O&&b.account_type==="dealer"&&!b.is_verified_dealer&&jsxs("button",{
          onClick:()=>X(b.id),disabled:v===b.id,className:"flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-secondary-600 disabled:opacity-50",children:[v===b.id?jsx(LoaderCircle,{
            className:"h-3.5 w-3.5 animate-spin"
          }):jsx(BadgeCheck,{
            className:"h-3.5 w-3.5"
          })," Verify"]
        }),!b.is_admin&&jsx("button",{
          onClick:()=>St(b.id),disabled:v===b.id,className:"flex h-9 w-9 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 disabled:opacity-50",children:v===b.id?jsx(LoaderCircle,{
            className:"h-4 w-4 animate-spin"
          }):jsx(Cn,{
            className:"h-4 w-4"
          })
        })]
      })]
    })
  },b.id),Fs=()=>{
    var b;
    if(C)return jsxs("div",{
      className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
        className:"h-10 w-10 animate-spin text-primary-500"
      }),jsx("p",{
        className:"mt-4 text-sm text-gray-500",children:"Loading data..."
      })]
    });
    if(f)return jsxs("div",{
      className:"mb-6 flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
        className:"h-4 w-4 shrink-0 mt-0.5"
      }),jsx("span",{
        children:f
      }),jsx("button",{
        onClick:()=>m(null),className:"ml-auto text-error-400 hover:text-error-600",children:"×"
      })]
    });
    switch(r){
      case"dashboard":return jsxs("div",{
        children:[jsxs("div",{
          className:"mb-6",children:[jsx("h1",{
            className:"text-2xl font-extrabold tracking-tight text-gray-900",children:"Admin Dashboard"
          }),jsx("p",{
            className:"mt-1 text-sm text-gray-500",children:"Overview of platform activity and moderation."
          })]
        }),jsx("div",{
          className:"grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",children:ja.map(O=>{
            const q=O.icon;
            return jsxs("div",{
              className:"card p-4",children:[jsx("div",{
                className:`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${O.color}`,children:jsx(q,{
                  className:"h-5 w-5"
                })
              }),jsx("div",{
                className:"text-2xl font-extrabold text-gray-900",children:O.value
              }),jsx("div",{
                className:"text-xs font-medium text-gray-500",children:O.label
              })]
            },O.label)
          })
        }),Ve.length>0&&jsxs("div",{
          className:"mt-8",children:[jsx("h2",{
            className:"mb-4 text-lg font-bold text-gray-900",children:"Pending Approvals"
          }),jsx("div",{
            className:"space-y-3",children:Ve.map(Bt)
          })]
        })]
      });
      case"users":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"All Users"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[s.length," registered users"]
        }),jsx("div",{
          className:"space-y-3",children:s.map(O=>zs(O,!1))
        })]
      });
      case"dealers":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Dealers"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[we.length," dealer accounts"]
        }),we.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No dealers found."
        }):jsx("div",{
          className:"space-y-3",children:we.map(O=>zs(O,!0))
        })]
      });
      case"products":case"pending":case"featured":case"sponsored":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:r==="pending"?"Pending Approvals":r==="featured"?"Featured Products":r==="sponsored"?"Sponsored Products":"All Products"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:r==="pending"?`${Ve.length} awaiting review`:r==="featured"?`${yr.length} featured`:r==="sponsored"?`${Ft.length} sponsored`:`${l.length} total products`
        }),r==="products"&&jsxs("div",{
          className:"mb-4 flex flex-col gap-3 sm:flex-row",children:[jsxs("div",{
            className:"relative flex-1",children:[jsx(Search,{
              className:"absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            }),jsx("input",{
              type:"text",value:x,onChange:O=>S(O.target.value),placeholder:"Search by title, brand, or city...",className:"input-field pl-11"
            })]
          }),jsxs("select",{
            value:L,onChange:O=>z(O.target.value),className:"input-field sm:w-48",children:[jsx("option",{
              value:"all",children:"All Status"
            }),jsx("option",{
              value:"draft",children:"Draft"
            }),jsx("option",{
              value:"pending",children:"Pending"
            }),jsx("option",{
              value:"approved",children:"Approved"
            }),jsx("option",{
              value:"rejected",children:"Rejected"
            })]
          })]
        }),jsx("div",{
          className:"space-y-3",children:r==="pending"?Ve.map(Bt):r==="featured"?yr.length?yr.map(Bt):jsx("div",{
            className:"card py-16 text-center text-gray-500",children:"No featured products."
          }):r==="sponsored"?Ft.length?Ft.map(Bt):jsx("div",{
            className:"card py-16 text-center text-gray-500",children:"No sponsored products."
          }):Ms.length?Ms.map(Bt):jsx("div",{
            className:"card py-16 text-center text-gray-500",children:"No products found."
          })
        })]
      });
      case"categories":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Categories"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[c.length," categories"]
        }),jsx("div",{
          className:"grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",children:c.map(O=>jsx("div",{
            className:"card p-4",children:jsxs("div",{
              className:"flex items-center gap-3",children:[jsx("div",{
                className:"flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600",children:jsx(Sun,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"flex-1",children:[jsx("h3",{
                  className:"text-sm font-bold text-gray-900",children:O.name
                }),jsxs("p",{
                  className:"text-xs text-gray-500",children:["/",O.slug]
                })]
              }),jsx("span",{
                className:`rounded-full px-2 py-0.5 text-xs font-semibold ${O.is_active?"bg-secondary-100 text-secondary-700":"bg-gray-100 text-gray-500"}`,children:O.is_active?"Active":"Inactive"
              })]
            })
          },O.id))
        })]
      });
      case"brands":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Brands"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[d.length," brands"]
        }),jsx("div",{
          className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",children:d.map(O=>jsxs("div",{
            className:"card p-4",children:[jsx("h3",{
              className:"text-sm font-bold text-gray-900",children:O.name
            }),jsxs("p",{
              className:"text-xs text-gray-500",children:["/",O.slug]
            }),jsx("span",{
              className:`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${O.is_active?"bg-secondary-100 text-secondary-700":"bg-gray-100 text-gray-500"}`,children:O.is_active?"Active":"Inactive"
            })]
          },O.id))
        })]
      });
      case"locations":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Locations"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Cities where products are listed"
        }),jsx("div",{
          className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",children:Array.from(new Set(l.map(O=>O.city))).map(O=>jsxs("div",{
            className:"card p-4",children:[jsxs("div",{
              className:"flex items-center gap-2",children:[jsx(MapPin,{
                className:"h-4 w-4 text-primary-500"
              }),jsx("h3",{
                className:"text-sm font-bold text-gray-900",children:O
              })]
            }),jsxs("p",{
              className:"mt-1 text-xs text-gray-500",children:[l.filter(q=>q.city===O).length," listings"]
            })]
          },O))
        })]
      });
      case"advertisements":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Advertisements"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[w.length," advertisements"]
        }),w.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No advertisements configured."
        }):jsx("div",{
          className:"space-y-3",children:w.map(O=>jsxs("div",{
            className:"card flex items-center gap-4 p-4",children:[jsx("div",{
              className:"h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:O.image_url?jsx("img",{
                src:O.image_url,alt:O.title,className:"h-full w-full object-cover"
              }):jsx(Megaphone,{
                className:"h-6 w-6 text-gray-300 m-auto"
              })
            }),jsxs("div",{
              className:"min-w-0 flex-1",children:[jsx("h3",{
                className:"text-sm font-bold text-gray-900",children:O.title
              }),jsxs("p",{
                className:"text-xs text-gray-500",children:["Placement: ",O.placement]
              })]
            }),jsx("span",{
              className:`rounded-full px-2 py-0.5 text-xs font-semibold ${O.is_active?"bg-secondary-100 text-secondary-700":"bg-gray-100 text-gray-500"}`,children:O.is_active?"Active":"Inactive"
            })]
          },O.id))
        })]
      });
      case"enquiries":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Messages & Enquiries"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[p.length," total enquiries"]
        }),p.length===0?jsx("div",{
          className:"card py-16 text-center text-gray-500",children:"No enquiries yet."
        }):jsx("div",{
          className:"space-y-3",children:p.map(O=>jsx("div",{
            className:"card p-4",children:jsxs("div",{
              className:"flex items-start gap-3",children:[jsx("div",{
                className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600",children:jsx(MessageSquare,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("p",{
                  className:"text-sm text-gray-700",children:O.message||"No message"
                }),O.contact_phone&&jsxs("p",{
                  className:"mt-1 text-xs text-gray-500",children:["Phone: ",O.contact_phone]
                }),jsx("p",{
                  className:"mt-1 text-xs text-gray-400",children:new Date(O.created_at).toLocaleDateString("en-PK")
                })]
              }),!O.is_read&&jsx("span",{
                className:"h-2 w-2 shrink-0 rounded-full bg-error-500"
              })]
            })
          },O.id))
        })]
      });
      case"reports":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Reports & Analytics"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Platform performance overview"
        }),jsxs("div",{
          className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(TrendingUp,{
                className:"h-4 w-4"
              })," Total Views"]
            }),jsx("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:Ds.toLocaleString()
            })]
          }),jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(Tag,{
                className:"h-4 w-4"
              })," Approval Rate"]
            }),jsxs("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:[l.length>0?Math.round(oe.length/l.length*100):0,"%"]
            })]
          }),jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(Store,{
                className:"h-4 w-4"
              })," Verified Dealers"]
            }),jsx("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:we.filter(O=>O.is_verified_dealer).length
            })]
          }),jsxs("div",{
            className:"card p-6",children:[jsxs("div",{
              className:"flex items-center gap-2 text-sm font-semibold text-gray-500",children:[jsx(MessageSquare,{
                className:"h-4 w-4"
              })," Enquiries"]
            }),jsx("div",{
              className:"mt-2 text-3xl font-extrabold text-gray-900",children:p.length
            })]
          })]
        })]
      });
      default:return jsx("div",{
        className:"flex flex-col items-center justify-center py-24",children:jsxs("div",{
          className:"card max-w-md p-8 text-center",children:[jsx(FileText,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("h2",{
            className:"mt-4 text-lg font-bold text-gray-900",children:((b=Us.find(O=>O.id===r))==null?void 0:b.label)||"Section"
          }),jsx("p",{
            className:"mt-2 text-sm text-gray-500",children:"This section is ready for configuration. Content will appear here once set up."
          })]
        })
      })
    }
  };
  return jsxs(Fragment,{
    children:[jsx(Df,{
      navItems:Us,activeTab:r,onTabChange:b=>n(b),onBack:t,badgeColor:"bg-error-100 text-error-700",headerLabel:"Admin",headerIcon:ShieldCheck,children:jsx("div",{
        className:"p-4 lg:p-8",children:Fs()
      })
    }),I&&jsx("div",{
      className:"fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4",onClick:()=>Y(null),children:jsxs("div",{
        className:"card max-w-md p-6",onClick:b=>b.stopPropagation(),children:[jsx("h2",{
          className:"text-lg font-bold text-gray-900",children:"Reject Listing"
        }),jsx("p",{
          className:"mt-1 text-sm text-gray-500",children:"Provide a reason for rejection (optional)."
        }),jsx("textarea",{
          value:ke,onChange:b=>ye(b.target.value),placeholder:"e.g. Does not meet quality guidelines...",className:"input-field mt-4 min-h-[80px]"
        }),jsxs("div",{
          className:"mt-4 flex justify-end gap-2",children:[jsx("button",{
            onClick:()=>{
              Y(null),ye("")
            },className:"btn-ghost",children:"Cancel"
          }),jsx("button",{
            onClick:Xe,className:"btn-primary bg-error-500 hover:bg-error-600",children:"Reject Listing"
          })]
        })]
      })
    })]
  })
}function wx({
  onBack:t
}){
  const{
    user:e,profile:r,refreshProfile:n
  }=useAuth(),[s,a]=useState("dashboard"),[l,o]=useState([]),[c,u]=useState([]),[d,h]=useState([]),[p,y]=useState([]),[w,j]=useState([]),[C,g]=useState(!0),[f,m]=useState(null),[v,k]=useState(null),[x,S]=useState(null),[L,z]=useState(""),[I,Y]=useState(""),[ke,ye]=useState(""),[Be,le]=useState(""),[We,Xe]=useState(""),[_,A]=useState({
    title:"",brand:BRANDS[0],category:"panel",condition:"new",price:"",city:CITIES[0],capacity_kw:"",warranty_years:"",image_url:"",description:"",seller_name:"",seller_phone:""
  }),[D,H]=useState("pending"),[X,St]=useState(""),[we,Ve]=useState(""),oe=(r==null?void 0:r.account_type)==="dealer",xt=useCallback(async()=>{
    if(!e)return;
    const[P,Q,de,te]=await Promise.all([supabase.from("solar_listings").select("*").eq("user_id",e.id).order("created_at",{
      ascending:!1
    }),supabase.from("enquiries").select("*").or(`sender_id.eq.${e.id},receiver_id.eq.${e.id}`).order("created_at",{
      ascending:!1
    }),supabase.from("favorites").select("*").eq("user_id",e.id).order("created_at",{
      ascending:!1
    }),supabase.from("notifications").select("*").eq("user_id",e.id).order("created_at",{
      ascending:!1
    })]);
    if(P.error?m(P.error.message):o(P.data||[]),Q.error?m(Q.error.message):u(Q.data||[]),h(de.data||[]),y(te.data||[]),de.data&&de.data.length>0){
      const T=de.data.map(ba=>ba.listing_id),{
        data:vt
      }=await supabase.from("solar_listings").select("*").in("id",T);
      j(vt||[])
    }
  },[e]);
  useEffect(()=>{
    if(!e){
      g(!1);
      return
    }g(!0),m(null),xt().finally(()=>g(!1))
  },[e,xt]),useEffect(()=>{
    r&&(z(r.full_name||""),Y(r.phone||""),ye(r.city||""),le(r.business_name||""),Xe(r.business_address||""))
  },[r]);
  const yr=async P=>{
    if(!confirm("Delete this listing?"))return;
    k(P);
    const{
      error:Q
    }=await supabase.from("solar_listings").delete().eq("id",P);
    Q?m(Q.message):o(de=>de.filter(te=>te.id!==P)),k(null)
  },Ft=async P=>{
    k(P);
    const Q=l.find(te=>te.id===P),{
      error:de
    }=await supabase.from("solar_listings").update({
      is_sold:!(Q!=null&&Q.is_sold)
    }).eq("id",P);
    de?m(de.message):o(te=>te.map(T=>T.id===P?{
      ...T,is_sold:!T.is_sold
    }:T)),k(null)
  },Ds=async P=>{
    k(P);
    const{
      error:Q
    }=await supabase.from("solar_listings").update({
      status:"pending"
    }).eq("id",P);
    Q?m(Q.message):o(de=>de.map(te=>te.id===P?{
      ...te,status:"pending"
    }:te)),k(null)
  },Ms=async P=>{
    k(P);
    const{
      error:Q
    }=await supabase.from("favorites").delete().eq("id",P);
    Q?m(Q.message):(h(de=>de.filter(te=>te.id!==P)),j(de=>de.filter(te=>{
      var T;
      return!((T=d.find(vt=>vt.id===P))!=null&&T.listing_id.includes(te.id))
    }))),k(null)
  },Us=async P=>{
    const{
      error:Q
    }=await supabase.from("notifications").update({
      is_read:!0
    }).eq("id",P);
    Q?m(Q.message):y(de=>de.map(te=>te.id===P?{
      ...te,is_read:!0
    }:te))
  },ja=async()=>{
    if(!e)return;
    k("profile");
    const{
      error:P
    }=await supabase.from("profiles").update({
      full_name:L,phone:I||null,city:ke||null,business_name:oe?Be:null,business_address:oe?We:null
    }).eq("id",e.id);
    P?m(P.message):(S("Profile updated successfully"),await n(),setTimeout(()=>S(null),3e3)),k(null)
  },Bt=async()=>{
    if(!e||!r)return;
    if(!_.title.trim()||!_.price.trim()){
      m("Please fill in title and price");
      return
    }k("add-product");
    const{
      error:P
    }=await supabase.from("solar_listings").insert({
      title:_.title,brand:_.brand,category:_.category,condition:_.condition,price:parseFloat(_.price),city:_.city,capacity_kw:_.capacity_kw?parseFloat(_.capacity_kw):null,warranty_years:_.warranty_years?parseInt(_.warranty_years):null,image_url:_.image_url||null,description:_.description||null,seller_name:_.seller_name||r.full_name,seller_phone:_.seller_phone||r.phone,user_id:e.id,status:D,featured:!1,sponsored:!1,is_sold:!1,views:0
    });
    P?m(P.message):(S(D==="draft"?"Draft saved":"Product submitted for approval"),A({
      title:"",brand:BRANDS[0],category:"panel",condition:"new",price:"",city:CITIES[0],capacity_kw:"",warranty_years:"",image_url:"",description:"",seller_name:"",seller_phone:""
    }),await xt(),a("products"),setTimeout(()=>S(null),3e3)),k(null)
  },zs=async()=>{
    if(X!==we){
      m("Passwords do not match");
      return
    }if(X.length<8){
      m("Password must be at least 8 characters");
      return
    }k("password");
    const{
      error:P
    }=await supabase.auth.updateUser({
      password:X
    });
    P?m(P.message):(S("Password changed successfully"),St(""),Ve(""),setTimeout(()=>S(null),3e3)),k(null)
  },Fs=l.filter(P=>P.status==="draft"),b=l.filter(P=>P.status==="pending"),O=l.filter(P=>P.status==="approved"),q=l.filter(P=>P.status==="rejected"),V=l.filter(P=>P.is_sold),_a=l.reduce((P,Q)=>P+(Q.views||0),0),Bs=p.filter(P=>!P.is_read),Mf=[{
    id:"dashboard",label:"Dashboard",icon:LayoutDashboard
  },{
    id:"profile",label:"EyeOff Profile",icon:User
  },{
    id:"products",label:"EyeOff Products",icon:Tag,badge:l.length
  },{
    id:"add-product",label:"Add Product",icon:CirclePlus
  },{
    id:"drafts",label:"Draft Products",icon:FilePen,badge:Fs.length
  },{
    id:"pending",label:"Pending Products",icon:Clock,badge:b.length
  },{
    id:"approved",label:"Approved Products",icon:CircleCheckBig,badge:O.length
  },{
    id:"rejected",label:"Rejected Products",icon:CircleX,badge:q.length
  },{
    id:"sold",label:"Sold Products",icon:DollarSign,badge:V.length
  },{
    id:"favorites",label:"Favorites",icon:Heart,badge:d.length
  },{
    id:"messages",label:"Messages",icon:MessageSquare,badge:c.length
  },{
    id:"enquiries",label:"Enquiries",icon:Mail
  },{
    id:"notifications",label:"Notifications",icon:Bell,badge:Bs.length
  },{
    id:"settings",label:"Account Settings",icon:Settings
  },{
    id:"password",label:"Change Password",icon:Lock
  }],fc=P=>jsx("div",{
    className:"card p-4",children:jsxs("div",{
      className:"flex items-start gap-4",children:[jsx("div",{
        className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:P.image_url?jsx("img",{
          src:P.image_url,alt:P.title,className:"h-full w-full object-cover"
        }):jsx("div",{
          className:"flex h-full items-center justify-center",children:jsx(Tag,{
            className:"h-6 w-6 text-gray-300"
          })
        })
      }),jsxs("div",{
        className:"min-w-0 flex-1",children:[jsx("h3",{
          className:"truncate text-sm font-bold text-gray-900",children:P.title
        }),jsxs("div",{
          className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
            className:"font-semibold text-primary-600",children:CATEGORIES[P.category]
          }),jsx("span",{
            children:"•"
          }),jsx("span",{
            children:P.brand
          }),jsx("span",{
            children:"•"
          }),jsx("span",{
            children:P.city
          }),jsx("span",{
            children:"•"
          }),jsx("span",{
            className:"font-bold text-gray-700",children:formatPrice(P.price)
          }),jsx("span",{
            children:"•"
          }),jsxs("span",{
            className:"flex items-center gap-0.5",children:[jsx(Eye,{
              className:"h-3 w-3"
            }),P.views]
          })]
        }),jsxs("div",{
          className:"mt-1.5 flex flex-wrap items-center gap-2",children:[jsx("span",{
            className:`rounded-full px-2 py-0.5 text-xs font-bold ${P.status==="approved"?"bg-secondary-100 text-secondary-700":P.status==="pending"?"bg-warning-100 text-warning-700":P.status==="rejected"?"bg-error-100 text-error-700":"bg-gray-100 text-gray-600"}`,children:P.status.charAt(0).toUpperCase()+P.status.slice(1)
          }),P.featured&&jsx("span",{
            className:"rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700",children:"Featured"
          }),P.sponsored&&jsx("span",{
            className:"rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700",children:"Sponsored"
          }),P.is_sold&&jsx("span",{
            className:"rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700",children:"Sold"
          }),P.status==="rejected"&&P.rejection_reason&&jsxs("span",{
            className:"text-xs text-error-500",children:["Reason: ",P.rejection_reason]
          })]
        })]
      }),jsxs("div",{
        className:"flex shrink-0 flex-col items-end gap-1.5",children:[P.status==="draft"&&jsxs("button",{
          onClick:()=>Ds(P.id),disabled:v===P.id,className:"flex items-center gap-1 rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 disabled:opacity-50",children:[v===P.id?jsx(LoaderCircle,{
            className:"h-3 w-3 animate-spin"
          }):jsx(Clock,{
            className:"h-3 w-3"
          }),"Submit"]
        }),!P.is_sold&&P.status==="approved"&&jsxs("button",{
          onClick:()=>Ft(P.id),disabled:v===P.id,className:"flex items-center gap-1 rounded-lg bg-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50",children:[jsx(DollarSign,{
            className:"h-3 w-3"
          })," Mark Sold"]
        }),P.is_sold&&jsxs("button",{
          onClick:()=>Ft(P.id),disabled:v===P.id,className:"flex items-center gap-1 rounded-lg bg-secondary-100 px-2.5 py-1.5 text-xs font-semibold text-secondary-700 hover:bg-secondary-200 disabled:opacity-50",children:[jsx(CircleCheckBig,{
            className:"h-3 w-3"
          })," Mark Available"]
        }),jsx("button",{
          onClick:()=>yr(P.id),disabled:v===P.id,className:"flex h-8 w-8 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 disabled:opacity-50",children:v===P.id?jsx(LoaderCircle,{
            className:"h-3.5 w-3.5 animate-spin"
          }):jsx(Cn,{
            className:"h-3.5 w-3.5"
          })
        })]
      })]
    })
  },P.id),Uf=()=>{
    var de;
    if(C)return jsxs("div",{
      className:"flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
        className:"h-10 w-10 animate-spin text-primary-500"
      }),jsx("p",{
        className:"mt-4 text-sm text-gray-500",children:"Loading your dashboard..."
      })]
    });
    const P=()=>f&&jsxs("div",{
      className:"mb-6 flex items-start gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700",children:[jsx(CircleAlert,{
        className:"h-4 w-4 shrink-0 mt-0.5"
      }),jsx("span",{
        children:f
      }),jsx("button",{
        onClick:()=>m(null),className:"ml-auto text-error-400 hover:text-error-600",children:"×"
      })]
    }),Q=()=>x&&jsxs("div",{
      className:"mb-6 flex items-start gap-2 rounded-lg bg-secondary-50 p-3 text-sm text-secondary-700",children:[jsx(CircleCheckBig,{
        className:"h-4 w-4 shrink-0 mt-0.5"
      }),jsx("span",{
        children:x
      })]
    });
    switch(s){
      case"dashboard":return jsxs("div",{
        children:[jsxs("div",{
          className:"mb-6",children:[jsxs("h1",{
            className:"text-2xl font-extrabold tracking-tight text-gray-900",children:["Welcome, ",((de=r==null?void 0:r.full_name)==null?void 0:de.split(" ")[0])||"User","!"]
          }),jsxs("p",{
            className:"mt-1 text-sm text-gray-500",children:[oe?"Dealer Dashboard":"Seller Dashboard"," — manage your products and enquiries."]
          })]
        }),P(),Q(),jsx("div",{
          className:"grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4",children:[{
            label:"EyeOff Products",value:l.length,icon:Tag,color:"text-primary-500 bg-primary-50"
          },{
            label:"Approved",value:O.length,icon:CircleCheckBig,color:"text-secondary-500 bg-secondary-50"
          },{
            label:"Pending",value:b.length,icon:Clock,color:"text-warning-500 bg-warning-50"
          },{
            label:"Rejected",value:q.length,icon:CircleX,color:"text-error-500 bg-error-50"
          },{
            label:"Sold",value:V.length,icon:DollarSign,color:"text-gray-600 bg-gray-100"
          },{
            label:"Favorites",value:d.length,icon:Heart,color:"text-error-500 bg-error-50"
          },{
            label:"Enquiries",value:c.length,icon:MessageSquare,color:"text-accent-500 bg-accent-50"
          },{
            label:"Total Views",value:_a,icon:TrendingUp,color:"text-primary-500 bg-primary-50"
          }].map(T=>{
            const vt=T.icon;
            return jsxs("div",{
              className:"card p-4",children:[jsx("div",{
                className:`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${T.color}`,children:jsx(vt,{
                  className:"h-5 w-5"
                })
              }),jsx("div",{
                className:"text-2xl font-extrabold text-gray-900",children:T.value
              }),jsx("div",{
                className:"text-xs font-medium text-gray-500",children:T.label
              })]
            },T.label)
          })
        }),b.length>0&&jsxs("div",{
          className:"mt-8",children:[jsx("h2",{
            className:"mb-4 text-lg font-bold text-gray-900",children:"Awaiting Approval"
          }),jsx("div",{
            className:"space-y-3",children:b.map(fc)
          })]
        })]
      });
      case"profile":return jsxs("div",{
        className:"max-w-2xl",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"EyeOff Profile"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Update your personal information"
        }),P(),Q(),jsxs("div",{
          className:"card p-6",children:[jsxs("div",{
            className:"mb-6 flex items-center gap-4",children:[jsx("div",{
              className:"flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600",children:oe?jsx(Store,{
                className:"h-8 w-8 text-white"
              }):jsx("span",{
                className:"text-2xl font-bold text-white",children:L.charAt(0).toUpperCase()
              })
            }),jsxs("div",{
              children:[jsx("h2",{
                className:"text-lg font-bold text-gray-900",children:r==null?void 0:r.full_name
              }),jsx("p",{
                className:"text-sm text-gray-500",children:e==null?void 0:e.email
              }),oe&&jsx("span",{
                className:`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${r!=null&&r.is_verified_dealer?"bg-secondary-100 text-secondary-700":"bg-warning-100 text-warning-700"}`,children:r!=null&&r.is_verified_dealer?jsxs(Fragment,{
                  children:[jsx(BadgeCheck,{
                    className:"h-3 w-3"
                  })," Verified Dealer"]
                }):"Pending Verification"
              })]
            })]
          }),jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Full Name"
              }),jsx("input",{
                type:"text",value:L,onChange:T=>z(T.target.value),className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Phone"
              }),jsx("input",{
                type:"text",value:I,onChange:T=>Y(T.target.value),className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"City"
              }),jsxs("select",{
                value:ke,onChange:T=>ye(T.target.value),className:"input-field",children:[jsx("option",{
                  value:"",children:"Select city"
                }),CITIES.map(T=>jsx("option",{
                  value:T,children:T
                },T))]
              })]
            }),oe&&jsxs(Fragment,{
              children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Business Name"
                }),jsx("input",{
                  type:"text",value:Be,onChange:T=>le(T.target.value),className:"input-field"
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Business Address"
                }),jsx("input",{
                  type:"text",value:We,onChange:T=>Xe(T.target.value),className:"input-field"
                })]
              })]
            }),jsxs("button",{
              onClick:ja,disabled:v==="profile",className:"btn-primary",children:[v==="profile"?jsx(LoaderCircle,{
                className:"h-4 w-4 animate-spin"
              }):jsx(CircleCheckBig,{
                className:"h-4 w-4"
              }),"Save Changes"]
            })]
          })]
        })]
      });
      case"add-product":return jsxs("div",{
        className:"max-w-2xl",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Add Product"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"List a new solar product for sale"
        }),P(),Q(),jsx("div",{
          className:"card p-6",children:jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Product Title *"
              }),jsx("input",{
                type:"text",value:_.title,onChange:T=>A({
                  ..._,title:T.target.value
                }),placeholder:"e.g. Longi 450W Solar Panel",className:"input-field"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Brand"
                }),jsx("select",{
                  value:_.brand,onChange:T=>A({
                    ..._,brand:T.target.value
                  }),className:"input-field",children:BRANDS.map(T=>jsx("option",{
                    value:T,children:T
                  },T))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Category"
                }),jsxs("select",{
                  value:_.category,onChange:T=>A({
                    ..._,category:T.target.value
                  }),className:"input-field",children:[jsx("option",{
                    value:"panel",children:"Solar Panels"
                  }),jsx("option",{
                    value:"inverter",children:"Inverters"
                  }),jsx("option",{
                    value:"battery",children:"Batteries"
                  }),jsx("option",{
                    value:"complete_system",children:"Complete Systems"
                  })]
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Condition"
                }),jsxs("select",{
                  value:_.condition,onChange:T=>A({
                    ..._,condition:T.target.value
                  }),className:"input-field",children:[jsx("option",{
                    value:"new",children:"New"
                  }),jsx("option",{
                    value:"used",children:"Used"
                  })]
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Price (Rs) *"
                }),jsx("input",{
                  type:"number",value:_.price,onChange:T=>A({
                    ..._,price:T.target.value
                  }),placeholder:"e.g. 50000",className:"input-field"
                })]
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"City"
                }),jsx("select",{
                  value:_.city,onChange:T=>A({
                    ..._,city:T.target.value
                  }),className:"input-field",children:CITIES.map(T=>jsx("option",{
                    value:T,children:T
                  },T))
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Capacity (kW)"
                }),jsx("input",{
                  type:"number",value:_.capacity_kw,onChange:T=>A({
                    ..._,capacity_kw:T.target.value
                  }),placeholder:"e.g. 5",className:"input-field"
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Warranty (years)"
              }),jsx("input",{
                type:"number",value:_.warranty_years,onChange:T=>A({
                  ..._,warranty_years:T.target.value
                }),placeholder:"e.g. 10",className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Image URL"
              }),jsx("input",{
                type:"text",value:_.image_url,onChange:T=>A({
                  ..._,image_url:T.target.value
                }),placeholder:"https://...",className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Description"
              }),jsx("textarea",{
                value:_.description,onChange:T=>A({
                  ..._,description:T.target.value
                }),placeholder:"Describe your product...",className:"input-field min-h-[80px]"
              })]
            }),jsxs("div",{
              className:"grid grid-cols-2 gap-4",children:[jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Seller Name"
                }),jsx("input",{
                  type:"text",value:_.seller_name,onChange:T=>A({
                    ..._,seller_name:T.target.value
                  }),placeholder:(r==null?void 0:r.full_name)||"",className:"input-field"
                })]
              }),jsxs("div",{
                children:[jsx("label",{
                  className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Seller Phone"
                }),jsx("input",{
                  type:"text",value:_.seller_phone,onChange:T=>A({
                    ..._,seller_phone:T.target.value
                  }),placeholder:(r==null?void 0:r.phone)||"",className:"input-field"
                })]
              })]
            }),jsxs("div",{
              className:"flex gap-3 BadgeCheck-2",children:[jsxs("button",{
                onClick:()=>{
                  H("pending"),Bt()
                },disabled:v==="add-product",className:"btn-primary flex-1",children:[v==="add-product"?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(CirclePlus,{
                  className:"h-4 w-4"
                }),"Submit for Approval"]
              }),jsxs("button",{
                onClick:()=>{
                  H("draft"),Bt()
                },disabled:v==="add-product",className:"btn-ghost flex-1",children:[jsx(FilePen,{
                  className:"h-4 w-4"
                }),"Save Bell Draft"]
              })]
            })]
          })
        })]
      });
      case"products":case"drafts":case"pending":case"approved":case"rejected":case"sold":const te=s==="products"?l:s==="drafts"?Fs:s==="pending"?b:s==="approved"?O:s==="rejected"?q:V;
      return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:s==="products"?"EyeOff Products":s==="drafts"?"Draft Products":s==="pending"?"Pending Products":s==="approved"?"Approved Products":s==="rejected"?"Rejected Products":"Sold Products"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[te.length," ",te.length===1?"product":"products"]
        }),P(),te.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(Package,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No products here"
          }),jsxs("button",{
            onClick:()=>a("add-product"),className:"btn-primary mt-4",children:[jsx(CirclePlus,{
              className:"h-4 w-4"
            })," Add a Product"]
          })]
        }):jsx("div",{
          className:"space-y-3",children:te.map(fc)
        })]
      });
      case"favorites":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Favorites"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[w.length," saved listings"]
        }),w.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(Heart,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No favorites yet"
          }),jsx("p",{
            className:"mt-1 text-sm text-gray-500",children:"Browse listings and tap the heart icon to save them."
          })]
        }):jsx("div",{
          className:"space-y-3",children:w.map(T=>{
            const vt=d.find(ba=>ba.listing_id===T.id);
            return jsxs("div",{
              className:"card flex items-center gap-4 p-4",children:[jsx("div",{
                className:"h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100",children:T.image_url?jsx("img",{
                  src:T.image_url,alt:T.title,className:"h-full w-full object-cover"
                }):jsx(Tag,{
                  className:"h-6 w-6 text-gray-300 m-auto"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("h3",{
                  className:"truncate text-sm font-bold text-gray-900",children:T.title
                }),jsxs("div",{
                  className:"mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500",children:[jsx("span",{
                    className:"font-semibold text-primary-600",children:CATEGORIES[T.category]
                  }),jsx("span",{
                    children:"•"
                  }),jsx("span",{
                    children:formatPrice(T.price)
                  }),jsx("span",{
                    children:"•"
                  }),jsxs("span",{
                    className:"flex items-center gap-0.5",children:[jsx(MapPin,{
                      className:"h-3 w-3"
                    }),T.city]
                  })]
                })]
              }),vt&&jsx("button",{
                onClick:()=>Ms(vt.id),disabled:v===vt.id,className:"flex h-9 w-9 items-center justify-center rounded-lg text-error-500 hover:bg-error-50 disabled:opacity-50",children:v===vt.id?jsx(LoaderCircle,{
                  className:"h-4 w-4 animate-spin"
                }):jsx(Cn,{
                  className:"h-4 w-4"
                })
              })]
            },T.id)
          })
        })]
      });
      case"messages":case"enquiries":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:s==="messages"?"Messages":"Enquiries"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[c.length," total"]
        }),c.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(MessageSquare,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No messages yet"
          })]
        }):jsx("div",{
          className:"space-y-3",children:c.map(T=>jsx("div",{
            className:"card p-4",children:jsxs("div",{
              className:"flex items-start gap-3",children:[jsx("div",{
                className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600",children:jsx(MessageSquare,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("p",{
                  className:"text-sm text-gray-700",children:T.message||"No message"
                }),T.contact_phone&&jsxs("p",{
                  className:"mt-1 flex items-center gap-1 text-xs text-gray-500",children:[jsx(Phone,{
                    className:"h-3 w-3"
                  }),T.contact_phone]
                }),jsxs("p",{
                  className:"mt-1 flex items-center gap-1 text-xs text-gray-400",children:[jsx(Calendar,{
                    className:"h-3 w-3"
                  }),new Date(T.created_at).toLocaleDateString("en-PK")]
                })]
              }),!T.is_read&&jsx("span",{
                className:"h-2 w-2 shrink-0 rounded-full bg-error-500"
              })]
            })
          },T.id))
        })]
      });
      case"notifications":return jsxs("div",{
        children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Notifications"
        }),jsxs("p",{
          className:"mb-6 text-sm text-gray-500",children:[p.length," total, ",Bs.length," unread"]
        }),p.length===0?jsxs("div",{
          className:"card py-16 text-center",children:[jsx(Bell,{
            className:"mx-auto h-12 w-12 text-gray-300"
          }),jsx("p",{
            className:"mt-4 text-sm font-semibold text-gray-700",children:"No notifications"
          })]
        }):jsx("div",{
          className:"space-y-3",children:p.map(T=>jsx("div",{
            className:`card p-4 ${T.is_read?"":"ring-1 ring-primary-200"}`,children:jsxs("div",{
              className:"flex items-start gap-3",children:[jsx("div",{
                className:`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${T.is_read?"bg-gray-100 text-gray-400":"bg-primary-50 text-primary-600"}`,children:jsx(Bell,{
                  className:"h-5 w-5"
                })
              }),jsxs("div",{
                className:"min-w-0 flex-1",children:[jsx("h3",{
                  className:"text-sm font-bold text-gray-900",children:T.title
                }),T.message&&jsx("p",{
                  className:"mt-0.5 text-sm text-gray-600",children:T.message
                }),jsx("p",{
                  className:"mt-1 text-xs text-gray-400",children:new Date(T.created_at).toLocaleDateString("en-PK")
                })]
              }),!T.is_read&&jsx("button",{
                onClick:()=>Us(T.id),className:"text-xs font-semibold text-primary-600 hover:text-primary-700",children:"Mark read"
              })]
            })
          },T.id))
        })]
      });
      case"settings":return jsxs("div",{
        className:"max-w-2xl",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Account Settings"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Manage your account preferences"
        }),P(),jsx("div",{
          className:"card p-6",children:jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Email"
              }),jsx("input",{
                type:"email",value:(e==null?void 0:e.email)||"",disabled:!0,className:"input-field bg-gray-50"
              }),jsx("p",{
                className:"mt-1 text-xs text-gray-400",children:"Email cannot be changed"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Account Type"
              }),jsxs("div",{
                className:"flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3",children:[oe?jsx(Store,{
                  className:"h-5 w-5 text-primary-500"
                }):jsx(User,{
                  className:"h-5 w-5 text-primary-500"
                }),jsx("span",{
                  className:"text-sm font-semibold text-gray-700",children:oe?"Dealer":"Individual"
                }),oe&&(r==null?void 0:r.is_verified_dealer)&&jsx(BadgeCheck,{
                  className:"h-4 w-4 text-secondary-500"
                })]
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Member Since"
              }),jsx("p",{
                className:"text-sm text-gray-600",children:r!=null&&r.created_at?new Date(r.created_at).toLocaleDateString("en-PK",{
                  year:"numeric",month:"long",day:"numeric"
                }):"N/A"
              })]
            })]
          })
        })]
      });
      case"password":return jsxs("div",{
        className:"max-w-md",children:[jsx("h1",{
          className:"mb-1 text-2xl font-extrabold tracking-tight text-gray-900",children:"Change Password"
        }),jsx("p",{
          className:"mb-6 text-sm text-gray-500",children:"Update your account password"
        }),P(),Q(),jsx("div",{
          className:"card p-6",children:jsxs("div",{
            className:"space-y-4",children:[jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"New Password"
              }),jsx("input",{
                type:"password",value:X,onChange:T=>St(T.target.value),className:"input-field"
              })]
            }),jsxs("div",{
              children:[jsx("label",{
                className:"mb-1.5 block text-sm font-semibold text-gray-700",children:"Confirm Password"
              }),jsx("input",{
                type:"password",value:we,onChange:T=>Ve(T.target.value),className:"input-field"
              })]
            }),jsxs("button",{
              onClick:zs,disabled:v==="password",className:"btn-primary",children:[v==="password"?jsx(LoaderCircle,{
                className:"h-4 w-4 animate-spin"
              }):jsx(Lock,{
                className:"h-4 w-4"
              }),"Change Password"]
            })]
          })
        })]
      });
      default:return null
    }
  };
  return jsx(Df,{
    navItems:Mf,activeTab:s,onTabChange:P=>a(P),onBack:t,badgeColor:"bg-primary-100 text-primary-700",headerLabel:oe?"Dealer":"Individual",headerIcon:oe?Store:User,children:jsx("div",{
      className:"p-4 lg:p-8",children:Uf()
    })
  })
}function jx({
  listingId:t,onBack:e
}){
  const[r,n]=useState(null),[s,a]=useState(null),[l,o]=useState(!0),[c,u]=useState(null),[d,h]=useState(!1);
  if(useEffect(()=>{
    (async()=>{
      o(!0),u(null);
      try{
        const{
          data:m,error:v
        }=await supabase.from("solar_listings").select("*").eq("id",t).maybeSingle();
        if(v)throw v;
        if(!m){
          u("Listing not found");
          return
        }const k=m;
        if(n(k),await supabase.from("solar_listings").update({
          views:(k.views||0)+1
        }).eq("id",t),k.user_id){
          const{
            data:x
          }=await supabase.from("profiles").select("*").eq("id",k.user_id).maybeSingle();
          x&&a(x)
        }
      }catch(m){
        u(m instanceof Error?m.message:"Failed to load listing")
      }finally{
        o(!1)
      }
    })()
  },[t]),l)return jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsxs("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:[jsx(LoaderCircle,{
        className:"h-10 w-10 animate-spin text-primary-500"
      }),jsx("p",{
        className:"mt-4 text-sm text-gray-500",children:"Loading listing..."
      })]
    })
  });
  if(c||!r)return jsx("div",{
    className:"min-h-screen bg-gray-50",children:jsx("div",{
      className:"container-page flex flex-col items-center justify-center py-24",children:jsxs("div",{
        className:"card max-w-md p-8 text-center",children:[jsx("p",{
          className:"text-lg font-semibold text-gray-700",children:c||"Listing not found"
        }),jsxs("button",{
          onClick:e,className:"btn-ghost mt-6",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Listings"]
        })]
      })
    })
  });
  const p=r.condition==="used",y=(s==null?void 0:s.business_name)||(s==null?void 0:s.full_name)||r.seller_name||"Seller",w=r.seller_phone||(s==null?void 0:s.phone)||null,j=(s==null?void 0:s.account_type)==="dealer",C=[{
    label:"Brand",value:r.brand
  },{
    label:"Category",value:CATEGORIES[r.category]
  },{
    label:"Condition",value:p?"Used":"New"
  },{
    label:"Capacity",value:r.capacity_kw?`${r.capacity_kw} kW`:null
  },{
    label:"Warranty",value:r.warranty_years?`${r.warranty_years} years`:null
  },{
    label:"City",value:r.city
  }],g=new Date(r.created_at).toLocaleDateString("en-PK",{
    year:"numeric",month:"long",day:"numeric"
  });
  return jsxs("div",{
    className:"min-h-screen bg-gray-50",children:[jsx("div",{
      className:"sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md",children:jsxs("div",{
        className:"container-page flex h-16 items-center justify-between",children:[jsxs("button",{
          onClick:e,className:"flex items-center gap-2",children:[jsx("div",{
            className:"flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30",children:jsx(Sun,{
              className:"h-5 w-5 text-white",strokeWidth:2.5
            })
          }),jsxs("span",{
            className:"text-xl font-extrabold tracking-tight text-gray-900",children:["Sell",jsx("span",{
              className:"text-primary-500",children:"Solar"
            })]
          })]
        }),jsxs("button",{
          onClick:e,className:"flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900",children:[jsx(ArrowLeft,{
            className:"h-4 w-4"
          }),"Back to Listings"]
        })]
      })
    }),jsx("div",{
      className:"container-page py-8 lg:py-12",children:jsxs("div",{
        className:"mx-auto max-w-5xl",children:[jsxs("div",{
          className:"mb-6 flex items-center gap-2 text-sm text-gray-500",children:[jsx("button",{
            onClick:e,className:"hover:text-gray-700",children:"Home"
          }),jsx("span",{
            children:"/"
          }),jsx("span",{
            className:"font-semibold text-primary-600",children:CATEGORIES[r.category]
          }),jsx("span",{
            children:"/"
          }),jsx("span",{
            className:"truncate text-gray-400",children:r.title
          })]
        }),jsxs("div",{
          className:"grid grid-cols-1 gap-8 lg:grid-cols-5",children:[jsxs("div",{
            className:"lg:col-span-3",children:[jsx("div",{
              className:"card overflow-hidden",children:jsxs("div",{
                className:"relative aspect-[4/3] bg-gray-100",children:[r.image_url?jsx("img",{
                  src:r.image_url,alt:r.title,className:"h-full w-full object-cover"
                }):jsx("div",{
                  className:"flex h-full items-center justify-center bg-gray-100",children:jsx(Zap,{
                    className:"h-16 w-16 text-gray-300"
                  })
                }),jsxs("div",{
                  className:"absolute left-4 top-4 flex gap-2",children:[jsx("span",{
                    className:`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${p?"bg-warning-500 text-white":"bg-secondary-500 text-white"}`,children:p?"Used":"New"
                  }),r.featured&&jsxs("span",{
                    className:"flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white shadow-sm",children:[jsx(Tag,{
                      className:"h-3 w-3"
                    }),"Featured"]
                  })]
                }),jsxs("div",{
                  className:"absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm",children:[jsx(Eye,{
                    className:"h-3 w-3"
                  }),r.views," views"]
                })]
              })
            }),r.description&&jsxs("div",{
              className:"card mt-6 p-6",children:[jsx("h2",{
                className:"mb-3 text-lg font-bold text-gray-900",children:"Description"
              }),jsx("p",{
                className:"text-sm leading-relaxed text-gray-600 whitespace-pre-line",children:r.description
              })]
            }),jsxs("div",{
              className:"card mt-6 p-6",children:[jsx("h2",{
                className:"mb-4 text-lg font-bold text-gray-900",children:"Specifications"
              }),jsx("div",{
                className:"grid grid-cols-1 gap-3 sm:grid-cols-2",children:C.map(f=>jsxs("div",{
                  className:"flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3",children:[jsx("span",{
                    className:"text-sm font-medium text-gray-500",children:f.label
                  }),jsx("span",{
                    className:"text-sm font-bold text-gray-900",children:f.value||"—"
                  })]
                },f.label))
              })]
            })]
          }),jsx("div",{
            className:"lg:col-span-2",children:jsxs("div",{
              className:"sticky top-24 space-y-4",children:[jsxs("div",{
                className:"card p-6",children:[jsx("h1",{
                  className:"text-xl font-extrabold leading-tight text-gray-900",children:r.title
                }),jsx("div",{
                  className:"mt-3 flex items-center gap-2",children:jsx("span",{
                    className:"text-3xl font-extrabold text-primary-600",children:formatPrice(r.price)
                  })
                }),jsxs("div",{
                  className:"mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500",children:[jsxs("span",{
                    className:"flex items-center gap-1",children:[jsx(MapPin,{
                      className:"h-4 w-4"
                    }),r.city]
                  }),jsxs("span",{
                    className:"flex items-center gap-1",children:[jsx(Calendar,{
                      className:"h-4 w-4"
                    }),g]
                  })]
                }),jsxs("div",{
                  className:"mt-5 space-y-3",children:[w?jsxs(Fragment,{
                    children:[jsxs("a",{
                      href:`tel:${w}`,className:"btn-primary w-full",children:[jsx(Phone,{
                        className:"h-5 w-5"
                      }),"Call Seller"]
                    }),!d&&jsxs("button",{
                      onClick:()=>h(!0),className:"btn-ghost w-full",children:[jsx(Eye,{
                        className:"h-4 w-4"
                      }),"Show Phone Number"]
                    }),d&&jsxs("div",{
                      className:"rounded-xl bg-primary-50 p-4 text-center",children:[jsx("div",{
                        className:"text-xs font-semibold text-gray-500",children:"Phone Number"
                      }),jsx("div",{
                        className:"mt-1 text-lg font-extrabold text-primary-700",children:w
                      })]
                    })]
                  }):jsx("div",{
                    className:"rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500",children:"No contact number provided"
                  }),jsxs("button",{
                    className:"btn-ghost w-full",children:[jsx(MessageCircle,{
                      className:"h-4 w-4"
                    }),"Send Message"]
                  }),jsxs("button",{
                    className:"btn-ghost w-full",children:[jsx(Share2,{
                      className:"h-4 w-4"
                    }),"Share Listing"]
                  })]
                })]
              }),jsxs("div",{
                className:"card p-6",children:[jsx("h3",{
                  className:"mb-4 text-sm font-bold uppercase tracking-wide text-gray-500",children:"Seller Information"
                }),jsxs("div",{
                  className:"flex items-center gap-3",children:[jsx("div",{
                    className:"flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600",children:j?jsx(Store,{
                      className:"h-6 w-6 text-white"
                    }):jsx("span",{
                      className:"text-lg font-bold text-white",children:y.charAt(0).toUpperCase()
                    })
                  }),jsxs("div",{
                    className:"min-w-0 flex-1",children:[jsxs("div",{
                      className:"flex items-center gap-2",children:[jsx("h4",{
                        className:"truncate text-sm font-bold text-gray-900",children:y
                      }),j&&(s==null?void 0:s.is_verified_dealer)&&jsx(BadgeCheck,{
                        className:"h-4 w-4 shrink-0 text-secondary-500"
                      })]
                    }),j&&jsx("span",{
                      className:"text-xs font-semibold text-primary-600",children:s!=null&&s.is_verified_dealer?"Verified Dealer":"Dealer"
                    })]
                  })]
                }),jsxs("div",{
                  className:"mt-4 space-y-2 text-sm text-gray-600",children:[s!=null&&s.phone||r.seller_phone?jsxs("div",{
                    className:"flex items-center gap-2",children:[jsx(Phone,{
                      className:"h-4 w-4 text-gray-400"
                    }),(s==null?void 0:s.phone)||r.seller_phone]
                  }):null,(s==null?void 0:s.city)&&jsxs("div",{
                    className:"flex items-center gap-2",children:[jsx(MapPin,{
                      className:"h-4 w-4 text-gray-400"
                    }),s.city]
                  }),j&&(s==null?void 0:s.business_address)&&jsxs("div",{
                    className:"flex items-start gap-2",children:[jsx(Store,{
                      className:"h-4 w-4 mt-0.5 text-gray-400 shrink-0"
                    }),jsx("span",{
                      className:"line-clamp-2",children:s.business_address
                    })]
                  }),j&&(s==null?void 0:s.cnic)&&jsxs("div",{
                    className:"flex items-center gap-2",children:[jsx(ShieldCheck,{
                      className:"h-4 w-4 text-gray-400"
                    }),"CNIC: ",s.cnic.slice(0,5),"••••••",s.cnic.slice(-1)]
                  })]
                })]
              }),jsxs("div",{
                className:"card bg-warning-50/50 p-4 ring-1 ring-warning-100",children:[jsxs("h4",{
                  className:"flex items-center gap-1.5 text-sm font-bold text-warning-700",children:[jsx(ShieldCheck,{
                    className:"h-4 w-4"
                  }),"Safety Tips"]
                }),jsxs("ul",{
                  className:"mt-2 space-y-1 text-xs text-warning-600",children:[jsx("li",{
                    children:"• Meet in a safe, public place"
                  }),jsx("li",{
                    children:"• Check the item before paying"
                  }),jsx("li",{
                    children:"• Never pay in advance"
                  }),jsx("li",{
                    children:"• Verify seller identity"
                  })]
                })]
              })]
            })
          })]
        })]
      })
    })]
  })
}const Vu={
  category:"",brand:"",condition:"",city:"",minPrice:"",maxPrice:"",query:""
};
function _x({
  onSelectListing:t
}){
  const[e,r]=useState(Vu),[n,s]=useState([]),[a,l]=useState(!0),[o,c]=useState(null),[u,d]=useState(0),[h,p]=useState(0),y=useCallback((g,f)=>{
    r(m=>({
      ...m,[g]:f
    }))
  },[]),w=useCallback(()=>{
    p(f=>f+1);
    const g=document.getElementById("listings");
    g&&g.scrollIntoView({
      behavior:"smooth",block:"start"
    })
  },[]),j=useCallback(()=>{
    r(Vu),p(g=>g+1)
  },[]),C=useCallback(g=>{
    r(m=>({
      ...m,category:g
    })),p(m=>m+1);
    const f=document.getElementById("listings");
    f&&f.scrollIntoView({
      behavior:"smooth",block:"start"
    })
  },[]);
  return useEffect(()=>{
    (async()=>{
      l(!0),c(null);
      try{
        let f=supabase.from("solar_listings").select("*",{
          count:"exact"
        }).order("featured",{
          ascending:!1
        }).order("created_at",{
          ascending:!1
        });
        e.category&&(f=f.eq("category",e.category)),e.brand&&(f=f.eq("brand",e.brand)),e.condition&&(f=f.eq("condition",e.condition)),e.city&&(f=f.eq("city",e.city)),e.minPrice&&(f=f.gte("price",parseFloat(e.minPrice))),e.maxPrice&&(f=f.lte("price",parseFloat(e.maxPrice))),e.query&&(f=f.or(`title.ilike.%${e.query}%,brand.ilike.%${e.query}%,description.ilike.%${e.query}%`));
        const{
          data:m,error:v,count:k
        }=await f.limit(50);
        if(v)throw v;
        s(m||[]),d(k||0)
      }catch(f){
        c(f instanceof Error?f.message:"Failed to load listings"),s([])
      }finally{
        l(!1)
      }
    })()
  },[h,e.category,e.brand,e.condition,e.city,e.minPrice,e.maxPrice,e.query]),jsxs(Fragment,{
    children:[jsx(nx,{
      filters:e,onFilterChange:y,onSearch:w,onReset:j
    }),jsx(ix,{
      onSelectCategory:C
    }),jsx(lx,{
      listings:n,loading:a,error:o,totalCount:u,onSelectListing:t
    }),jsx(cx,{
      
    })]
  })
}export default function App(){
  const{
    user:t,profile:e,loading:r
  }=useAuth(),[n,s]=useState("home"),[a,l]=useState(null),o=d=>{
    s(d),window.scrollTo({
      top:0,behavior:"smooth"
    })
  },c=()=>{
    o(t?"post-ad":"login")
  },u=d=>{
    l(d),o("listing-detail")
  };
  return r?jsx("div",{
    className:"flex min-h-screen items-center justify-center bg-white",children:jsx("div",{
      className:"flex h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500"
    })
  }):n==="login"?jsx(Bn,{
    onSuccess:()=>o("home"),onBack:()=>o("home")
  }):n==="dealers"?jsx(mx,{
    onBack:()=>o("home")
  }):n==="post-ad"?t?jsx(yx,{
    onBack:()=>o("home"),onPosted:()=>o("home")
  }):jsx(Bn,{
    onSuccess:()=>o("post-ad"),onBack:()=>o("home")
  }):n==="admin"?!t||!(e!=null&&e.is_admin)?jsx(Bn,{
    onSuccess:()=>o("admin"),onBack:()=>o("home")
  }):jsx(xx,{
    onBack:()=>o("home")
  }):n==="admin-dashboard"?!t||!(e!=null&&e.is_admin)?jsx(Bn,{
    onSuccess:()=>o("admin-dashboard"),onBack:()=>o("home")
  }):jsx(vx,{
    onBack:()=>o("home")
  }):n==="dashboard"?t?jsx(wx,{
    onBack:()=>o("home")
  }):jsx(Bn,{
    onSuccess:()=>o("dashboard"),onBack:()=>o("home")
  }):n==="listing-detail"&&a?jsx(jx,{
    listingId:a,onBack:()=>o("home")
  }):jsxs("div",{
    className:"min-h-screen bg-white",children:[jsx(Xy,{
      onNavigate:d=>{
        d==="post-ad"?c():d==="admin"||d==="admin-dashboard"?t&&(e!=null&&e.is_admin)?o("admin-dashboard"):o("login"):o(d==="dashboard"?t?"dashboard":"login":d)
      },currentPage:n
    }),jsx("main",{
      children:jsx(_x,{
        onSelectListing:u
      })
    }),jsx(hx,{
      onPostAd:c
    })]
  })
}

