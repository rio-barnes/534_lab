(function(root){
function calculate(input,horizon=30){
 const p={savingsShare:100,escrow:0,prepaid:0,points:0,lenderCredit:0,scheduledRepair:0,repairYear:5,...input};
 const down=p.price*p.down/100,baseLoan=p.price-down,va=p.financing==='va';
 const feeRate=va&&baseLoan>0&&p.vaStatus!=='exempt'?(p.down>=10?1.25:p.down>=5?1.5:p.vaStatus==='subsequent'?3.3:2.15):0;
 const fundingFee=baseLoan*feeRate/100,financedFee=va&&p.vaFeePayment!=='cash'?fundingFee:0;
 const loan=baseLoan+financedFee,n=p.term*12,r=p.rate/1200;
 const payment=loan===0?0:r===0?loan/n:loan*r/(1-Math.pow(1+r,-n));
 const points=baseLoan*p.points/100,closingExpense=p.price*p.closing/100,credit=baseLoan>0?Math.min(p.lenderCredit,closingExpense+points):0;
 const buyStart=down+closingExpense+points-credit+p.repairs+fundingFee-financedFee+p.escrow+p.prepaid,rentStart=p.deposit+p.rentFees;
 const capital=Math.max(buyStart,rentStart);let buyInvest=capital-buyStart,rentInvest=capital-rentStart,balance=loan;
 let buyContributions=0,rentContributions=0,buyConsumed=0,rentConsumed=0,prepaidRemaining=p.prepaid;
 const buyInitial=buyInvest,rentInitial=rentInvest,share=p.savingsShare/100,im=Math.pow(1+p.invest/100,1/12)-1;
 let rows=[],firstBuy=0,firstRent=0,totalPrincipal=0,firstBills=0,firstMaintenance=0;
 function row(m,buyCost=0,rentCost=0){const value=p.price*Math.pow(1+p.appreciation/100,m/12),saleCosts=value*p.selling/100,equity=value-saleCosts-balance;return {month:m,year:m/12,value,saleCosts,balance,equity,buyInvest,rentInvest,buy:equity+buyInvest+p.escrow+prepaidRemaining,rent:rentInvest+p.deposit,buyCost,rentCost,principal:totalPrincipal,buyInitial,rentInitial,buyContributions,rentContributions,buyGrowth:buyInvest-buyInitial-buyContributions,rentGrowth:rentInvest-rentInitial-rentContributions,buyConsumed,rentConsumed,escrow:p.escrow,prepaidRemaining};}
 rows.push(row(0));
 for(let m=1;m<=horizon*12;m++){
 const year=(m-1)/12,g=Math.pow(1+p.expenseGrowth/100,year);
 const interest=balance*r,paid=m<=n?Math.min(payment,balance+interest):0,principal=Math.max(0,paid-interest);balance=Math.max(0,balance-principal);totalPrincipal+=principal;
 const pmi=!va&&loan>0&&balance>p.price*.8?loan*p.pmi/1200:0;
 const insurance=p.insurance*g/12,prepaidUsed=Math.min(prepaidRemaining,insurance);prepaidRemaining-=prepaidUsed;
 const bills=paid+(p.price*p.tax/100+p.hoa*12+p.utilities*12)*g/12+insurance-prepaidUsed+pmi;
 const maintenance=p.price*p.maintenance/100*g/12;
 const repair=(m===p.repairYear*12?p.scheduledRepair:0)+(m===p.shockYear*12?p.shock:0);
 const buyCost=bills+maintenance+repair,rentCost=p.rent*Math.pow(1+p.rentGrowth/100,year)+p.renterInsurance*g;
 buyInvest*=1+im;rentInvest*=1+im;
 if(buyCost>rentCost){rentInvest+=(buyCost-rentCost)*share;rentContributions+=(buyCost-rentCost)*share;rentConsumed+=(buyCost-rentCost)*(1-share);}else{buyInvest+=(rentCost-buyCost)*share;buyContributions+=(rentCost-buyCost)*share;buyConsumed+=(rentCost-buyCost)*(1-share);}
 if(m<=12){firstBuy+=buyCost/12;firstRent+=rentCost/12;firstBills+=bills/12;firstMaintenance+=maintenance/12;}rows.push(row(m,buyCost,rentCost));
 }
 const selected=rows[Math.min(rows.length-1,Math.round(p.years*12))];
 let breakEven=null;for(let m=1;m<rows.length;m++){if(rows[m].buy>=rows[m].rent&&rows.slice(m).every(x=>x.buy>=x.rent)){breakEven=m/12;break;}}
 return {rows,selected,payment,loan,baseLoan,fundingFee,feeRate,financedFee,buyStart,rentStart,capital,firstBuy,firstRent,firstBills,firstMaintenance,breakEven,points,credit,closingExpense};
}
if(typeof module!=='undefined')module.exports={calculate};root.HousingModel={calculate};
})(typeof window==='undefined'?globalThis:window);
