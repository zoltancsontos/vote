<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Candidates extends CI_Controller {
	
	/**
	 * Public constructor
	 * @return void
	 */
	public function __construct() {
		parent::__construct();
	}

	/**
	 * Index Page for this controller.
	 */
	public function index() {
		$this->get();
	}
	
	/**
	 * Method responsible for returning chart data
	 * @return void
	 */
	function get() {
		$this->load->model('candidates_model', 'candidates');
		$data = $this->candidates->get_candidate_list();
		
		$this->output->set_header("Content-Type: text/html; charset=UTF-8");
		$this->output->set_content_type('application/json')->set_output(json_encode($data));
	}
	
	/**
	 * Method responsible for storing the votes
	 * @return void
	 */
	public function put() {
		$this->load->model('candidates_model', 'candidates');
		
		$input_data = json_decode(file_get_contents('php://input'), true);
		$fb_user_id = $input_data['fbUserId'];
		$candidate_id = $input_data['candidateId'];
		$gender = $input_data['gender'];
		
		$hash = $this->create_hash($fb_user_id);
		$data = [];
		
		$this->output->set_header("Content-Type: text/html; charset=UTF-8");
		
		if ( !$this->candidates->check_if_already_voted($hash) ) {
			$this->output->set_header("HTTP/1.0 200 OK");
			$this->candidates->add_vote($hash, $candidate_id, $gender);
		} else {
			$this->output->set_header("HTTP/1.0 206 OK");
		}
		
		$data = $this->candidates->get_candidate_list();
		$this->output->set_content_type('application/json')->set_output(json_encode($data));
	}
	
	/**
	 * Returns a sha1 hash
	 * @param string $user_id
	 * @return string
	 */
	public function create_hash($user_id) {
		$this->load->library('encrypt');
		$encodedStr = $this->encrypt->sha1($user_id);
		return $encodedStr;
	}
	
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */