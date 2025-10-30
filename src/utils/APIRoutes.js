// export const domain = 'http://192.168.18.214:9005';
export const domain = "https://nftvault.biz";
// export const frontend = 'http://localhost:3000';
export const frontend = "https://nftvault.biz";
export const dollar = "$";
export const reciepientaddress = "0x06a178358A151631FdBb83A334108182F4fd1142";
export const token_contract = "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3";

export const endpoint = {
  registration_api: `${domain}/api/v1/member-registration`,
  login_api: `${domain}/api/v1/member-login`,
  admin_login_api: `${domain}/api/v1/admin-login`,

  customer_api: `${domain}/api/v1/member-name-by-cust-id`,

  //img
  create_nft_image: `${domain}/api/v1/craete-image-nft-cat`,
  get_nft_image: `${domain}/api/v1/get-image-nft-cat`,
  update_nft_image: `${domain}/api/v1/update-image-nft-cat`,
  delete_nft_image: `${domain}/api/v1/delete-image-nft-cat`,

  get_member_dashboard_view: `${domain}/api/v1/get-member-dashboard-admin-view`,

  //treeadmin
  get_member_downline_tree_by_admin: `${domain}/api/v1/get-member-downline-tree-by-admin`,

  //nft
  create_nft: `${domain}/api/v1/craete-nft`,
  get_nft_Admin: `${domain}/api/v1/get-nft-admin`,
  get_nft: `${domain}/api/v1/get-nft`,
  update_status_nft: `${domain}/api/v1/update-status-nft`,
  get_nft_dropdown: `${domain}/api/v1/get-nft-dropdown`,
  assign_nft_by_admin: `${domain}/api/v1/nft-assign-by-admin`,

  get_nft_by_user: `${domain}/api/v1/get-nft-by-user`,
  trading: `${domain}/api/v1/trading`,
  get_nft_details: `${domain}/api/v1/get-trading-details`,

  get_package: `${domain}/api/v1/get-package`,
  member_topup_admin: `${domain}/api/v1/member-topup-by-admin`,
  activation_request: `${domain}/api/v1/activation-request`,
  dummy_activation_request: `${domain}/api/v1/activation-dummy-request`,
  activation_request: `${domain}/api/v1/activation-request`,

  dummy_activation_request_nft: `${domain}/api/v1/activation-dummy-request-nft`,
  activation_request_nft: `${domain}/api/v1/activation-request-nft`,

  member_profile_detail: `${domain}/api/v1/member-profile-details`,
  member_detail: `${domain}/api/v1/member-details`,
  roi_income_api: `${domain}/api/v1/get-income-details`,

  network_downline_api: `${domain}/api/v1/get-member-downline-tree`,
  get_downline_api: `${domain}/api/v1/get-member-downline`,
  get_member_dashboard_api: `${domain}/api/v1/get-member-dashboard`,
  admin_dashboard: `${domain}/api/v1/get-admin-dashboard`,
  master_data: `${domain}/api/v1/get-master-data`,
  change_general_status: `${domain}/api/v1/udpate-master-data`,

  //old
  trader_registration_api: `${domain}/api/v1/trader-registration`,
  add_user_withdrawal: `${domain}/api/v1/user-withdrawal-req`,
  withdrawal_list: `${domain}/api/v1/withdrawal-report`,
  add_wallet_address: `${domain}/api/v1/update-wallet-address`,
  user_deposit_req: `${domain}/api/v1/user-deposit-req`,
  withdrawal_request_status: `${domain}/api/v1/withdrawal-req-approval`,
  dashboard_data: `${domain}/api/v1/user-dashboard-data`,
  reward_manual: `${domain}/api/v1/reward-income-credited`,
  admin_update_user_profile: `${domain}/api/v1/change-member-profile`,
  update_user_profile: `${domain}/api/v1/change-member-profile-by-user`,

  topup_report: `${domain}/api/v1/topup-report`,
  admin_topup_report: `${domain}/api/v1/admin-topup-report`,
  user_details: `${domain}/api/v1/user-invester-details`,
  admin_user_details: `${domain}/api/v1/admin-invester-details`,
  update_user_password: `${domain}/api/v1/update-user-password`,
  admin_withdrawal_list: `${domain}/api/v1/admin-withdrawal-report`,
  admin_upload_qr: `${domain}/api/v1/admin-upload-qr`,
  get_admin_upload_qr: `${domain}/api/v1/get-admin-upload-qr`,
  get_user_upload_qr: `${domain}/api/v1/get-user-upload-qr`,
  add_user_fund_request: `${domain}/api/v1/add-user-fund-request`,
  get_user_fund_request: `${domain}/api/v1/get-user-fund-request`,
  admin_paying_report: `${domain}/api/v1/get-admin-fund-request`,
  change_status_fund: `${domain}/api/v1/change-fund-request_admin`,
  direct_referral_user: `${domain}/api/v1/user-direct-referral-details`,
  team_downline_user: `${domain}/api/v1/user-team-downline-details`,
  team_downline_user_filterwise: `${domain}/api/v1/user-team-downline-details-filterwise`,
  forgot_email: `${domain}/api/v1/password-on-mail`,

  // admin api
  member_list_details: `${domain}/api/v1/member-list-details`,
  trader_list_details: `${domain}/api/v1/trader-list-details`,
  change_verification: `${domain}/api/v1/change-verification-status`,

  status_nft_image: `${domain}/api/v1/update-image-galary-status`,
  contact_support: `${domain}/api/v1/contact-support-list`,

  create_ticket: `${domain}/api/v1/create-ticket`,
  send_ticket_reply: `${domain}/api/v1/sender-reply`,
  get_all_ticket: `${domain}/api/v1/all-tickets`,
  get_ticket_replies: `${domain}/api/v1/ticket`,
  my_tickets: `${domain}/api/v1/my-tickets`,
  close_tickets: `${domain}/api/v1/close-ticket`,
};
