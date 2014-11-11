<?php

class Candidates_model extends CI_Model {

	const USER_VOTE_TABLE = "voters";
	const VOTE_OPTIONS_TABLE = "vote_options";
	
	/**
	 * Public constructor
	 * @return void
	 */
    function __construct() {
        parent::__construct();
    }
    
	/**
	 * Returns a list of candidates
	 * @return array
	 */
	public function get_candidate_list() {
		$data = array();
		$fields = array(
			self::VOTE_OPTIONS_TABLE . '.img',
			self::VOTE_OPTIONS_TABLE . '.name',
			self::VOTE_OPTIONS_TABLE . '.number',
			self::VOTE_OPTIONS_TABLE . '.work_title',
			self::VOTE_OPTIONS_TABLE . '.age',
			self::VOTE_OPTIONS_TABLE . '.parties',
			self::VOTE_OPTIONS_TABLE . '.votes',
			self::VOTE_OPTIONS_TABLE . '.last_update'
		);
		$this->db->select($fields);
		$this->db->from(self::VOTE_OPTIONS_TABLE);
		$query = $this->db->get();
		foreach ($query->result() as &$val) {
			$val->parties = json_decode($val->parties);
			array_push($data, $val);
		}
		return $data;
	}
	
	/**
	 * Checks if the user already voter
	 * @param string $hash
	 * @return boolean
	 */
	public function check_if_already_voted($hash) {
		$fields = array(self::USER_VOTE_TABLE . '.hash');
		$this->db->select($fields);
		$this->db->from(self::USER_VOTE_TABLE);
		$this->db->where('hash', $hash);
		$amount = $this->db->count_all_results();
		if ($amount !== 0) {
			return true;
		}
		return false;
	}
	
	/**
	 * Ads a single vote
	 * @param string $hash
	 * @param string $candidate_id
	 * @param string $gender
	 * @return void
	 */
	public function add_vote($hash, $candidate_id, $gender) {
		
		$data = array(
			self::USER_VOTE_TABLE . ".hash" => $hash,
			self::USER_VOTE_TABLE . ".gender" => $gender,
		);
		$insert = $this->db->insert(self::USER_VOTE_TABLE, $data);
		
		if ($insert) {
			$this->db->where("number", $candidate_id);
			$this->db->set('votes', 'votes+1', FALSE);
			$this->db->update(self::VOTE_OPTIONS_TABLE);
		}
		
	}

}